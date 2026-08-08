import { RobotsController } from './robots.controller';

describe('RobotsController', () => {
  it('returns a robot array that the dashboard can render', async () => {
    const roboticsService = {
      getAllRobots: jest.fn().mockResolvedValue([
        {
          id: 'robot-1',
          code: 'R1',
          name: 'Robot One',
          type: 'STORAGE_RETRIEVAL',
          status: 'IDLE',
          location: 'A1',
          zoneId: 'zone-a',
        },
      ]),
    };

    const controller = new RobotsController(
      roboticsService as any,
      { scheduleTask: jest.fn() } as any,
    );

    const result = await controller.getRobots();

    expect(Array.isArray(result)).toBe(true);
    expect(result).toEqual([
      expect.objectContaining({
        id: 'robot-1',
        code: 'R1',
        name: 'Robot One',
        status: 'IDLE',
      }),
    ]);
  });
});
