import { Job } from 'bullmq';
import { BaseAgentWorker } from '../../queues/baseWorker';
import { sendAGVCommand } from '../../tools/hardware_api';
import { logger } from '../../config';

interface MoveResult {
  agv_id: string;
  status: 'arrived' | 'failed';
  steps_executed: number;
  final_position: { x: number; y: number } | null;
  duration_ms: number;
}

export class DeviceControllerAgent extends BaseAgentWorker {
  constructor() { super('device-control'); }

  protected async process(job: Job): Promise<MoveResult> {
    const { agv_id, path, traceId } = job.data as {
      agv_id: string;
      path: Array<{ x: number; y: number }>;
      traceId?: string;
    };

    const start = Date.now();
    let stepsExecuted = 0;

    for (const point of path) {
      const result = await sendAGVCommand(agv_id, 'move', point);
      if (!result.success) {
        logger.warn({ agv_id, point, traceId }, 'AGV move step failed — stopping');
        return {
          agv_id,
          status: 'failed',
          steps_executed: stepsExecuted,
          final_position: stepsExecuted > 0 ? path[stepsExecuted - 1] : null,
          duration_ms: Date.now() - start,
        };
      }
      stepsExecuted++;
      await job.updateProgress(Math.round((stepsExecuted / Math.max(path.length, 1)) * 90));
      await new Promise(r => setTimeout(r, 80));
    }

    const final_position = path.length > 0 ? path[path.length - 1] : null;
    logger.info({ agv_id, steps: stepsExecuted, traceId }, 'AGV arrived');

    return { agv_id, status: 'arrived', steps_executed: stepsExecuted, final_position, duration_ms: Date.now() - start };
  }
}
