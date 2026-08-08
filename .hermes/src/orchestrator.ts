import { pathQueue, deviceQueue, inventoryQueue, exceptionQueue } from './queues/queueFactory';
import { pgPool, logger } from './config';

export interface DispatchResult {
  jobId: string;
  sku: string;
  zone: string;
  skill: string;
  queuedAt: string;
}

export interface OrchestratorOptions {
  skill?: 'store_in' | 'take_out' | 'inventory_check';
  priority?: number;
  traceId?: string;
}

export class Orchestrator {
  /**
   * Dispatch a warehouse command through the agent pipeline.
   * Supports skill-based routing and structured tracing.
   */
  async dispatch(command: string, opts: OrchestratorOptions = {}): Promise<DispatchResult> {
    const skuMatch = command.match(/SKU-(\w+)/i);
    const zoneMatch = command.match(/Zone-(\w+)/i);
    if (!skuMatch || !zoneMatch) {
      throw new Error('Invalid command format. Expected: "Move SKU-XXXX to Zone-YYY"');
    }

    const sku = skuMatch[0].toUpperCase();
    const zone = zoneMatch[0];
    const skill = opts.skill ?? 'store_in';
    const priority = opts.priority ?? 0;
    const traceId = opts.traceId ?? `trace-${Date.now()}`;
    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const queuedAt = new Date().toISOString();

    // Persist task record
    try {
      await pgPool.query(
        `INSERT INTO tasks (job_id, agent_type, payload, trace_id, status, created_at)
         VALUES ($1, $2, $3, $4, 'pending', NOW())
         ON CONFLICT (job_id) DO NOTHING`,
        [jobId, 'orchestrator', JSON.stringify({ command, sku, zone, skill }), traceId]
      );
    } catch (err: any) {
      logger.warn({ err: err.message, jobId }, 'Task DB insert skipped (table may not exist)');
    }

    const jobOpts = {
      priority,
      attempts: 3,
      backoff: { type: 'exponential' as const, delay: 1000 },
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 50 },
    };

    // Route by skill
    if (skill === 'inventory_check') {
      await inventoryQueue.add('check', { sku, traceId }, { ...jobOpts, jobId: `inv-${jobId}` });
    } else {
      // store_in / take_out: path → device → inventory
      const pathJob = await pathQueue.add(
        'plan',
        { from_sku: sku, to_zone: zone, traceId },
        { ...jobOpts, jobId: `path-${jobId}` }
      );

      await deviceQueue.add(
        'move',
        { agv_id: 'AGV-01', path: [], traceId },
        {
          ...jobOpts,
          jobId: `device-${jobId}`,
          parent: { id: pathJob.id!, queue: 'path-planning' },
        }
      );

      await inventoryQueue.add(
        'update',
        { sku, new_location: zone, delta: 0, traceId },
        {
          ...jobOpts,
          jobId: `inv-${jobId}`,
          parent: { id: pathJob.id!, queue: 'path-planning' },
        }
      );
    }

    logger.info({ jobId, sku, zone, skill, traceId }, 'Task dispatched');
    return { jobId, sku, zone, skill, queuedAt };
  }

  /** Dispatch to the exception handler queue */
  async handleException(jobId: string, error: string, originalData: unknown): Promise<void> {
    await exceptionQueue.add(
      'handle',
      { job_id: jobId, error, original_data: originalData },
      { attempts: 1, jobId: `exc-${jobId}` }
    );
    logger.warn({ jobId, error }, 'Exception dispatched');
  }
}
