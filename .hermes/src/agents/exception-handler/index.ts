import { Job } from 'bullmq';
import { BaseAgentWorker } from '../../queues/baseWorker';
import { logger, pgPool } from '../../config';

type RecoveryAction = 'retry' | 'reroute' | 'manual_intervention' | 'skip';

interface ExceptionResult {
  handled: boolean;
  job_id: string;
  action: RecoveryAction;
  reason: string;
}

const RETRY_ELIGIBLE_ERRORS = ['timeout', 'connection', 'network', 'ECONNREFUSED'];
const REROUTE_ELIGIBLE_ERRORS = ['sku not found', 'path blocked', 'zone unavailable'];

function selectRecovery(error: string): RecoveryAction {
  const lower = error.toLowerCase();
  if (RETRY_ELIGIBLE_ERRORS.some(e => lower.includes(e))) return 'retry';
  if (REROUTE_ELIGIBLE_ERRORS.some(e => lower.includes(e))) return 'reroute';
  return 'manual_intervention';
}

export class ExceptionHandlerAgent extends BaseAgentWorker {
  constructor() { super('exception-handling'); }

  protected async process(job: Job): Promise<ExceptionResult> {
    const { job_id, error, original_data } = job.data as {
      job_id: string;
      error: string;
      original_data: unknown;
    };

    const action = selectRecovery(error);
    logger.warn({ job_id, error, action }, 'Handling exception');

    // Persist exception record
    await pgPool.query(
      `INSERT INTO exception_log (job_id, error, action, original_data, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [job_id, error, action, JSON.stringify(original_data)]
    ).catch(() => {});

    return {
      handled: true,
      job_id,
      action,
      reason: `Selected "${action}" based on error pattern: "${error.slice(0, 120)}"`,
    };
  }
}
