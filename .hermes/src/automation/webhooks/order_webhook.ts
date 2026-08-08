import { Queue } from 'bullmq';
import { redisConnection } from '../../config';

export async function handleOrder(sku: string, quantity: number) {
  const queue = new Queue('inventory-mgmt', { connection: redisConnection });
  await queue.add('order-fulfill', { sku, delta: -quantity });
}
