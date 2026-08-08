import { Job } from 'bullmq';
import { BaseAgentWorker } from '../../queues/baseWorker';
import { pgPool, logger } from '../../config';

interface Coord { x: number; y: number; }
interface PathResult {
  from_sku: string;
  to_zone: string;
  path: Coord[];
  total_steps: number;
  estimated_duration_ms: number;
}

export class PathPlannerAgent extends BaseAgentWorker {
  constructor() { super('path-planning'); }

  protected async process(job: Job): Promise<PathResult> {
    const { from_sku, to_zone, traceId } = job.data as { from_sku: string; to_zone: string; traceId?: string };

    const res = await pgPool.query(
      `SELECT location_coords FROM inventory_items WHERE sku = $1`,
      [from_sku]
    );
    if (!res.rowCount) throw new Error(`SKU ${from_sku} not found in inventory`);

    const row = res.rows[0] as Record<string, unknown>;
    const start: Coord = (row.location_coords as Coord) ?? { x: 0, y: 0 };
    // Zone target lookup — fallback to centre if zone not mapped
    const zoneRes = await pgPool.query(
      `SELECT coords FROM zones WHERE code = $1 LIMIT 1`,
      [to_zone]
    ).catch(() => ({ rows: [] as any[] }));

    const target: Coord = zoneRes.rows[0]?.coords ?? { x: 50, y: 50 };

    const steps = Math.max(Math.abs(target.x - start.x), Math.abs(target.y - start.y), 1);
    const path: Coord[] = Array.from({ length: steps + 1 }, (_, i) => ({
      x: Math.round(start.x + (target.x - start.x) * (i / steps)),
      y: Math.round(start.y + (target.y - start.y) * (i / steps)),
    }));

    const estimated_duration_ms = steps * 150; // ~150ms per step
    logger.info({ jobId: job.id, from_sku, to_zone, steps, traceId }, 'Path planned');

    return { from_sku, to_zone, path, total_steps: path.length, estimated_duration_ms };
  }
}
