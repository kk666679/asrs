import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import { RobotTask } from '../types';

const prisma = new PrismaClient();

export class RoboticsService {
  async scheduleTask(task: Omit<RobotTask, 'id'>): Promise<string> {
    const robot = await prisma.robots.findUnique({
      where: { id: task.robotId },
    });

    if (!robot) {
      throw new Error('Robot not found');
    }

    if (robot.status !== 'IDLE') {
      throw new Error('Robot is not available');
    }

    const command = await prisma.robot_commands.create({
      data: {
        id: randomUUID(),
        robotId: task.robotId,
        type: task.type,
        priority: task.priority,
        parameters: task.parameters,
        userId: 'system', // Should be actual user ID
      },
    });

    await prisma.robots.update({
      where: { id: task.robotId },
      data: { status: 'WORKING' },
    });

    return command.id;
  }

  async executeCommand(commandId: string) {
    const command = await prisma.robot_commands.findUnique({
      where: { id: commandId },
      include: { robots: true },
    });

    if (!command) {
      throw new Error('Command not found');
    }

    try {
      await prisma.robot_commands.update({
        where: { id: commandId },
        data: {
          status: 'EXECUTING',
          startedAt: new Date(),
        },
      });

      const result = await this.performRobotAction(command);

      await prisma.robot_commands.update({
        where: { id: commandId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      await prisma.robots.update({
        where: { id: command.robotId },
        data: { status: 'IDLE' },
      });

      return result;
    } catch (error) {
      await prisma.robot_commands.update({
        where: { id: commandId },
        data: {
          status: 'FAILED',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      await prisma.robots.update({
        where: { id: command.robotId },
        data: { status: 'ERROR' },
      });

      throw error;
    }
  }

  private async performRobotAction(command: any) {
    switch (command.type) {
      case 'MOVE':
        return await this.executeMove(command);
      case 'PICK':
        return await this.executePick(command);
      case 'PLACE':
        return await this.executePlace(command);
      case 'SCAN':
        return await this.executeScan(command);
      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }
  }

  private async executeMove(command: any) {
    const { destination, speed = 1.0 } = command.parameters;

    // Simulate movement time based on distance
    const distance = this.calculateDistance(
      command.robot.location,
      destination,
    );
    const travelTime = (distance / speed) * 1000; // Convert to milliseconds

    // Simulate movement delay
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(travelTime, 5000)),
    );

    // Update robot location
    await prisma.robots.update({
      where: { id: command.robotId },
      data: { location: destination },
    });

    return { success: true, newLocation: destination, travelTime };
  }

  private async executePick(command: any) {
    const { binId, itemId, quantity } = command.parameters;

    const binItem = await prisma.bin_items.findFirst({
      where: { binId, itemId },
    });

    if (!binItem || binItem.quantity < quantity) {
      throw new Error('Insufficient quantity in bin');
    }

    // Update inventory
    await prisma.bin_items.update({
      where: { id: binItem.id },
      data: { quantity: binItem.quantity - quantity },
    });

    await prisma.bins.update({
      where: { id: binId },
      data: { currentLoad: { decrement: quantity } },
    });

    return { success: true, pickedQuantity: quantity };
  }

  private async executePlace(command: any) {
    const { binId, itemId, quantity } = command.parameters;

    const bin = await prisma.bins.findUnique({
      where: { id: binId },
    });

    if (!bin || bin.currentLoad + quantity > bin.capacity) {
      throw new Error('Bin capacity exceeded');
    }

    // Find or create bin item
    const existingBinItem = await prisma.bin_items.findFirst({
      where: { binId, itemId },
    });

    if (existingBinItem) {
      await prisma.bin_items.update({
        where: { id: existingBinItem.id },
        data: { quantity: existingBinItem.quantity + quantity },
      });
    } else {
      await prisma.bin_items.create({
        data: { id: randomUUID(), binId, itemId, quantity },
      });
    }

    await prisma.bins.update({
      where: { id: binId },
      data: { currentLoad: { increment: quantity } },
    });

    return { success: true, placedQuantity: quantity };
  }

  private async executeScan(command: any) {
    const { barcode } = command.parameters;

    // Try to find item, bin, or shipment with this barcode
    const [item, bin, shipment] = await Promise.all([
      prisma.items.findUnique({ where: { barcode } }),
      prisma.bins.findUnique({ where: { barcode } }),
      prisma.shipments.findUnique({ where: { barcode } }),
    ]);

    const result = item || bin || shipment;

    if (!result) {
      throw new Error('Barcode not found');
    }

    return {
      success: true,
      type: item ? 'item' : bin ? 'bin' : 'shipment',
      data: result,
    };
  }

  private calculateDistance(from: string | null, to: string): number {
    // Simple distance calculation - in real implementation, use actual coordinates
    if (!from) return 10; // Default distance from origin

    // Parse location strings and calculate distance
    const fromParts = from.split('-');
    const toParts = to.split('-');

    if (fromParts.length !== toParts.length) return 10;

    // Simple Manhattan distance
    let distance = 0;
    for (let i = 0; i < fromParts.length; i++) {
      const fromNum = parseInt(fromParts[i].replace(/\D/g, '')) || 0;
      const toNum = parseInt(toParts[i].replace(/\D/g, '')) || 0;
      distance += Math.abs(fromNum - toNum);
    }

    return Math.max(distance, 1);
  }

  async getAllRobots(type?: string, status?: string, zoneId?: string) {
    const robots = await prisma.robots.findMany({
      where: {
        ...(type && { type: type as any }),
        ...(status && { status: status as any }),
        ...(zoneId && { zoneId }),
      },
      include: {
        zones: {
          select: { id: true, code: true, name: true, temperature: true },
        },
        robot_commands: {
          where: { status: { in: ['PENDING', 'EXECUTING'] } },
          orderBy: { createdAt: 'desc' },
          take: 5, // Get recent active commands
        },
      },
      orderBy: { code: 'asc' },
    });

    // Enhance with status information
    const enhancedRobots = await Promise.all(
      robots.map(async (robot) => {
        try {
          const status = await this.getRobotStatus(robot.id);
          return {
            ...robot,
            queueLength: status.queueLength,
            estimatedIdleTime: status.estimatedIdleTime,
          };
        } catch {
          return robot;
        }
      }),
    );

    return enhancedRobots;
  }

  async createRobot(data: {
    code: string;
    name: string;
    type: string;
    zoneId: string;
    location?: string;
  }) {
    const { code, name, type, zoneId, location } = data;

    // Check if robot code already exists
    const existingRobot = await prisma.robots.findUnique({
      where: { code },
    });

    if (existingRobot) {
      throw new Error('Robot code already exists');
    }

    // Validate zone exists
    const zone = await prisma.zones.findUnique({
      where: { id: zoneId },
    });

    if (!zone) {
      throw new Error('Zone not found');
    }

    const robot = await prisma.robots.create({
      data: {
        id: randomUUID(),
        code,
        name,
        type: type as any,
        zoneId,
        location,
      },
      include: {
        zones: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    return robot;
  }

  async getAvailableRobots(zoneId?: string) {
    return await prisma.robots.findMany({
      where: {
        status: 'IDLE',
        ...(zoneId && { zoneId }),
      },
      include: {
        zones: true,
      },
    });
  }

  async getRobotStatus(robotId: string) {
    const robot = await prisma.robots.findUnique({
      where: { id: robotId },
      include: {
        robot_commands: {
          where: {
            status: { in: ['PENDING', 'EXECUTING'] },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!robot) {
      throw new Error('Robot not found');
    }

    return {
      robot,
      queueLength: robot.robot_commands.length,
      estimatedIdleTime: this.calculateEstimatedIdleTime(robot.robot_commands),
    };
  }

  private calculateEstimatedIdleTime(robot_commands: any[]): number {
    return robot_commands.reduce((total, cmd) => {
      // Estimate based on command type
      const estimates = {
        MOVE: 2,
        PICK: 1,
        PLACE: 1,
        SCAN: 0.5,
        CALIBRATE: 5,
      };
      return total + (estimates[cmd.type as keyof typeof estimates] || 2);
    }, 0);
  }
}
