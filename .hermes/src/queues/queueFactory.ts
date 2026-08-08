import { Queue } from 'bullmq';
import { redisConnection } from '../config';

export const pathQueue = new Queue('path-planning', { connection: redisConnection });
export const inventoryQueue = new Queue('inventory-mgmt', { connection: redisConnection });
export const deviceQueue = new Queue('device-control', { connection: redisConnection });
export const exceptionQueue = new Queue('exception-handling', { connection: redisConnection });
export const qualityQueue = new Queue('quality-inspection', { connection: redisConnection });
export const resultQueue = new Queue('results', { connection: redisConnection });
