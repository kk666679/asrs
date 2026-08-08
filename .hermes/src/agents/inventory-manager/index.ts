import { Job } from 'bullmq';
import { BaseAgentWorker } from '../../queues/baseWorker';
import { pgPool, logger } from '../../config';

interface InventoryResult {
  sku: string;
  updated: Record<string, unknown> | null;
  action: 'quantity_updated' | 'location_updated' | 'checked' | 'not_found';
}

export class InventoryManagerAgent extends BaseAgentWorker {
  constructor() { super('inventory-mgmt'); }

  protected async process(job: Job): Promise<InventoryResult> {
    const { sku, delta, new_location, traceId } = job.data as {
      sku: string;
      delta?: number;
      new_location?: string;
      traceId?: string;
    };

    // Validate SKU exists
    const existing = await pgPool.query(
      `SELECT * FROM inventory_items WHERE sku = $1`,
      [sku]
    );
    if (!existing.rowCount) {
      logger.warn({ sku, traceId }, 'SKU not found in inventory');
      return { sku, updated: null, action: 'not_found' };
    }

    let action: InventoryResult['action'] = 'checked';

    if (typeof delta === 'number' && delta !== 0) {
      await pgPool.query(
        `UPDATE inventory_items
         SET quantity = GREATEST(0, quantity + $1), updated_at = NOW()
         WHERE sku = $2`,
        [delta, sku]
      );
      action = 'quantity_updated';
    }

    if (new_location) {
      await pgPool.query(
        `UPDATE inventory_items SET location_zone = $1, updated_at = NOW() WHERE sku = $2`,
        [new_location, sku]
      );
      action = 'location_updated';
    }

    // Audit trail
    await pgPool.query(
      `INSERT INTO inventory_audit (sku, action, delta, new_location, trace_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [sku, action, delta ?? 0, new_location ?? null, traceId ?? null]
    ).catch(() => {}); // non-fatal if audit table absent

    const res = await pgPool.query(`SELECT * FROM inventory_items WHERE sku = $1`, [sku]);
    logger.info({ sku, action, traceId }, 'Inventory updated');

    return { sku, updated: (res.rows[0] as Record<string, unknown>) ?? null, action };
  }
}
