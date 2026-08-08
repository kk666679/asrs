import { Job } from 'bullmq';
import { BaseAgentWorker } from '../../queues/baseWorker';
import { inspectItem } from '../../tools/vision';
import { pgPool, logger } from '../../config';

interface QualityResult {
  sku: string;
  passed: boolean;
  defects: string[];
  confidence: number;
  inspectedAt: string;
  quarantined: boolean;
}

const QUARANTINE_THRESHOLD = 0.7; // confidence below this triggers quarantine

export class QualityInspectorAgent extends BaseAgentWorker {
  constructor() { super('quality-inspection'); }

  protected async process(job: Job): Promise<QualityResult> {
    const { sku, image_url, traceId } = job.data as {
      sku: string;
      image_url: string;
      traceId?: string;
    };

    const result = await inspectItem(image_url);
    const quarantined = !result.passed && result.confidence < QUARANTINE_THRESHOLD;

    if (quarantined) {
      await pgPool.query(
        `UPDATE inventory_items SET status = 'QUARANTINED', updated_at = NOW() WHERE sku = $1`,
        [sku]
      ).catch(() => {});
      logger.warn({ sku, defects: result.defects, traceId }, 'Item quarantined after quality inspection');
    }

    // Persist inspection record
    await pgPool.query(
      `INSERT INTO quality_inspections (sku, passed, defects, confidence, quarantined, trace_id, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [sku, result.passed, JSON.stringify(result.defects), result.confidence, quarantined, traceId ?? null]
    ).catch(() => {});

    logger.info({ sku, passed: result.passed, confidence: result.confidence, traceId }, 'Quality inspection done');

    return { sku, ...result, quarantined };
  }
}
