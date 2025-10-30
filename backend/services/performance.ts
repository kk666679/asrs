import { PrismaClient } from '@prisma/client';
import { PerformanceMetrics } from '../types';

const prisma = new PrismaClient();

export class PerformanceService {
  async calculateMetrics(period: string = '30d'): Promise<PerformanceMetrics> {
    const dateRange = this.getDateRange(period);

    const [throughput, accuracy, efficiency, costs] = await Promise.all([
      this.calculateThroughput(dateRange),
      this.calculateAccuracy(dateRange),
      this.calculateEfficiency(dateRange),
      this.calculateCosts(dateRange),
    ]);

    return {
      throughput,
      accuracy,
      efficiency,
      costs,
    };
  }

  private getDateRange(period: string) {
    const now = new Date();
    const start = new Date();

    switch (period) {
      case '7d':
        start.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    return { start, end: now };
  }

  private async calculateThroughput(dateRange: { start: Date; end: Date }) {
    const movements = await prisma.movement.aggregate({
      where: {
        status: 'COMPLETED',
        timestamp: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
      _sum: { quantity: true },
      _count: true,
    });

    const days = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const totalQuantity = movements._sum.quantity || 0;

    return {
      hourly: Math.round((totalQuantity / (days * 24)) * 100) / 100,
      daily: Math.round((totalQuantity / days) * 100) / 100,
      weekly: Math.round((totalQuantity / days) * 7 * 100) / 100,
    };
  }

  private async calculateAccuracy(dateRange: { start: Date; end: Date }) {
    const [totalMovements, completedMovements, failedMovements] =
      await Promise.all([
        prisma.movement.count({
          where: {
            timestamp: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        }),
        prisma.movement.count({
          where: {
            status: 'COMPLETED',
            timestamp: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        }),
        prisma.movement.count({
          where: {
            status: 'FAILED',
            timestamp: {
              gte: dateRange.start,
              lte: dateRange.end,
            },
          },
        }),
      ]);

    const accuracy =
      totalMovements > 0 ? (completedMovements / totalMovements) * 100 : 100;

    return {
      picking: Math.round(accuracy * 100) / 100,
      putaway: Math.round(accuracy * 100) / 100,
      inventory:
        Math.round(
          (100 - (failedMovements / Math.max(totalMovements, 1)) * 100) * 100,
        ) / 100,
    };
  }

  private async calculateEfficiency(dateRange: { start: Date; end: Date }) {
    // Space utilization
    const bins = await prisma.bin.findMany({
      select: {
        capacity: true,
        currentLoad: true,
      },
    });

    const totalCapacity = bins.reduce((sum, bin) => sum + bin.capacity, 0);
    const totalLoad = bins.reduce((sum, bin) => sum + bin.currentLoad, 0);
    const spaceUtilization =
      totalCapacity > 0 ? (totalLoad / totalCapacity) * 100 : 0;

    // Robot utilization
    const [totalRobots, activeRobots] = await Promise.all([
      prisma.robot.count(),
      prisma.robot.count({
        where: {
          status: { in: ['WORKING', 'IDLE'] },
        },
      }),
    ]);

    const robotUtilization =
      totalRobots > 0 ? (activeRobots / totalRobots) * 100 : 0;

    // Operator productivity (mock calculation)
    const completedTasks = await prisma.movement.count({
      where: {
        status: 'COMPLETED',
        timestamp: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    });

    const operatorCount = await prisma.user.count({
      where: {
        role: { in: ['OPERATOR', 'MANAGER'] },
        status: 'ACTIVE',
      },
    });

    const days = Math.ceil(
      (dateRange.end.getTime() - dateRange.start.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const operatorProductivity =
      operatorCount > 0 ? completedTasks / (operatorCount * days) : 0;

    return {
      spaceUtilization: Math.round(spaceUtilization * 100) / 100,
      robotUtilization: Math.round(robotUtilization * 100) / 100,
      operatorProductivity: Math.round(operatorProductivity * 100) / 100,
    };
  }

  private async calculateCosts(dateRange: { start: Date; end: Date }) {
    // Mock cost calculations - in real implementation, integrate with cost tracking
    const movements = await prisma.movement.count({
      where: {
        status: 'COMPLETED',
        timestamp: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    });

    const robotCommands = await prisma.robotCommand.count({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: dateRange.start,
          lte: dateRange.end,
        },
      },
    });

    // Estimated costs per operation
    const operationalCost = movements * 0.5; // $0.50 per movement
    const maintenanceCost = robotCommands * 0.1; // $0.10 per robot command
    const energyCost = (movements + robotCommands) * 0.05; // $0.05 per operation

    return {
      operationalCost: Math.round(operationalCost * 100) / 100,
      maintenanceCost: Math.round(maintenanceCost * 100) / 100,
      energyCost: Math.round(energyCost * 100) / 100,
    };
  }

  async generateReport(period: string = '30d') {
    const metrics = await this.calculateMetrics(period);
    const dateRange = this.getDateRange(period);

    return {
      period,
      dateRange,
      metrics,
      generatedAt: new Date(),
      summary: {
        totalThroughput: metrics.throughput.daily,
        averageAccuracy:
          (metrics.accuracy.picking +
            metrics.accuracy.putaway +
            metrics.accuracy.inventory) /
          3,
        overallEfficiency:
          (metrics.efficiency.spaceUtilization +
            metrics.efficiency.robotUtilization +
            metrics.efficiency.operatorProductivity) /
          3,
        totalCosts:
          metrics.costs.operationalCost +
          metrics.costs.maintenanceCost +
          metrics.costs.energyCost,
      },
    };
  }
}
