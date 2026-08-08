import { Orchestrator } from '../../src/orchestrator';

describe('Orchestrator', () => {
  it('should dispatch a task and return a DispatchResult', async () => {
    const orch = new Orchestrator();
    const result = await orch.dispatch('Move SKU-1234 to Zone-B');
    expect(result).toHaveProperty('jobId');
    expect(result.jobId).toMatch(/^job-\d+/);
    expect(result.sku).toBe('SKU-1234');
    expect(result.zone).toBe('Zone-B');
    expect(result.skill).toBe('store_in');
    expect(result.queuedAt).toBeTruthy();
  });

  it('should throw on invalid command format', async () => {
    const orch = new Orchestrator();
    await expect(orch.dispatch('invalid command')).rejects.toThrow('Invalid command format');
  });
});
