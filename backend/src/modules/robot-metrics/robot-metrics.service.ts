import { Injectable } from '@nestjs/common';

@Injectable()
export class RobotMetricsService {
  findAll() {
    return {
      metrics: {
        '1': {
          timestamp: new Date().toISOString(),
          batteryLevel: 85,
          temperature: 42,
          signalStrength: 95,
          currentLoad: 25,
          speed: 1.2
        },
        '2': {
          timestamp: new Date().toISOString(),
          batteryLevel: 92,
          temperature: 38,
          signalStrength: 88,
          currentLoad: 0,
          speed: 0
        }
      }
    };
  }

  findOne(id: string) {
    const allMetrics = this.findAll().metrics;
    return allMetrics[id] || null;
  }
}