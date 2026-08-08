import { PathPlannerAgent } from '../../../src/agents/path-planner';
import { Job } from 'bullmq';

describe('PathPlannerAgent', () => {
  it('should return a typed PathResult with path array', async () => {
    const agent = new PathPlannerAgent();
    const job = {
      id: 'test-job-1',
      data: { from_sku: 'SKU-1234', to_zone: 'Zone-B', traceId: 'trace-test' },
      updateProgress: async () => {},
    } as unknown as Job;

    const result = await (agent as any).process(job);
    expect(result).toHaveProperty('path');
    expect(Array.isArray(result.path)).toBe(true);
    expect(result).toHaveProperty('total_steps');
    expect(result).toHaveProperty('estimated_duration_ms');
    expect(result.from_sku).toBe('SKU-1234');
    expect(result.to_zone).toBe('Zone-B');
  });
});
