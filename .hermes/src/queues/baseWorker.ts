import { Worker, Job, Queue } from 'bullmq';
import { redisConnection, logger, pgPool } from '../config';

const resultQueue = new Queue('results', { connection: redisConnection });
const dlqQueue = new Queue('dead-letter', { connection: redisConnection });

export abstract class BaseAgentWorker {
  protected queueName: string;
  private worker: Worker;

  constructor(queueName: string, concurrency = 5) {
    this.queueName = queueName;
    this.worker = new Worker(
      queueName,
      async (job) => this.handleJob(job),
      { connection: redisConnection, concurrency }
    );

    this.worker.on('failed', async (job, err) => {
      logger.error({ jobId: job?.id, queue: queueName, err: err.message }, 'Job failed');
      // Route to DLQ after max attempts exhausted
      if (job && (job.attemptsMade >= (job.opts.attempts ?? 1))) {
        await dlqQueue.add('dead', {
          originalQueue: queueName,
          jobId: job.id,
          data: job.data,
          error: err.message,
          failedAt: new Date().toISOString(),
        }, { removeOnComplete: { count: 200 } });
        logger.warn({ jobId: job.id, queue: queueName }, 'Job moved to dead-letter queue');
      }
    });

    this.worker.on('error', (err) => {
      logger.error({ queue: queueName, err: err.message }, 'Worker error');
    });
  }

  private async handleJob(job: Job): Promise<void> {
    logger.info({ jobId: job.id, queue: this.queueName, attempt: job.attemptsMade + 1 }, 'Processing');

    try {
      await pgPool.query(
        `UPDATE tasks SET status = 'active', updated_at = NOW() WHERE job_id = $1`,
        [job.id]
      ).catch(() => {}); // non-fatal if tasks table absent

      await job.updateProgress(10);
      const result = await this.process(job);
      await job.updateProgress(100);

      await pgPool.query(
        `UPDATE tasks SET status = 'completed', result = $1, updated_at = NOW() WHERE job_id = $2`,
        [JSON.stringify(result), job.id]
      ).catch(() => {});

      // Emit to results queue for orchestrator consumption
      await resultQueue.add('result', {
        jobId: job.id,
        queue: this.queueName,
        traceId: job.data.traceId,
        result,
        completedAt: new Date().toISOString(),
      }, { removeOnComplete: { count: 500 } });

      logger.info({ jobId: job.id, queue: this.queueName }, 'Completed');
    } catch (error: any) {
      logger.error({ jobId: job.id, queue: this.queueName, error: error.message }, 'Failed');
      await pgPool.query(
        `UPDATE tasks SET status = 'failed', error = $1, updated_at = NOW() WHERE job_id = $2`,
        [error.message, job.id]
      ).catch(() => {});
      throw error;
    }
  }

  async gracefulShutdown(): Promise<void> {
    await this.worker.close();
    logger.info({ queue: this.queueName }, 'Worker shut down gracefully');
  }

  protected abstract process(job: Job): Promise<unknown>;
}
