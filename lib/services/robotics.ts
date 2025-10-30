import { randomUUID } from "crypto";
import { prisma } from '@/lib/db';
import { RobotTask } from '@/lib/types';

export class RoboticsService {
  async scheduleTask(task: Omit<RobotTask, 'id'>): Promise<string> {
    const robot = await prisma.robot.findUnique({
      where: { id: task.robotId }
    });

    if (!robot) {
      throw new Error('Robot not found');
    }

    if (robot.status !== 'IDLE') {
      throw new Error('Robot is not available');
    }

    const command = await prisma.robotCommand.create({ data: {
        id: randomUUID(),
        robotId: task.robotId,
        type: task.type,
        priority: task.priority,
        parameters: task.parameters,
        userId: 'system' // Should be actual user ID
      }
    });

    await prisma.robot.update({
      where: { id: task.robotId },
      data: { status: 'WORKING' }
    });

    return command.id;
  }

  async executeCommand(commandId: string) {
    const command = await prisma.robotCommand.findUnique({
      where: { id: commandId },
      include: { robot: true }
    });

    if (!command) {
      throw new Error('Command not found');
    }

    try {
      await prisma.robotCommand.update({
        where: { id: commandId },
        data: {
          status: 'EXECUTING',
          startedAt: new Date()
        }
      });

      const result = await this.performRobotAction(command);

      await prisma.robotCommand.update({
        where: { id: commandId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      });

      await prisma.robot.update({
        where: { id: command.robotId },
        data: { status: 'IDLE' }
      });

      return result;
    } catch (error) {
      await prisma.robotCommand.update({
        where: { id: commandId },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      await prisma.robot.update({
        where: { id: command.robotId },
        data: { status: 'ERROR' }
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
    const distance = this.calculateDistance(command.robot.location, destination);
    const travelTime = (distance / speed) * 1000; // Convert to milliseconds
    
    // Simulate movement delay
    await new Promise(resolve => setTimeout(resolve, Math.min(travelTime, 5000)));
    
    // Update robot location
    await prisma.robot.update({
      where: { id: command.robotId },
      data: { location: destination }
    });

    return { success: true, newLocation: destination, travelTime };
  }

  private async executePick(command: any) {
    const { binId, itemId, quantity } = command.parameters;
    
    const binItem = await prisma.binItem.findFirst({
      where: { binId, itemId }
    });

    if (!binItem || binItem.quantity < quantity) {
      throw new Error('Insufficient quantity in bin');
    }

    // Update inventory
    await prisma.binItem.update({
      where: { id: binItem.id },
      data: { quantity: binItem.quantity - quantity }
    });

    await prisma.bin.update({
      where: { id: binId },
      data: { currentLoad: { decrement: quantity } }
    });

    return { success: true, pickedQuantity: quantity };
  }

  private async executePlace(command: any) {
    const { binId, itemId, quantity } = command.parameters;
    
    const bin = await prisma.bin.findUnique({
      where: { id: binId }
    });

    if (!bin || (bin.currentLoad + quantity) > bin.capacity) {
      throw new Error('Bin capacity exceeded');
    }

    // Find or create bin item
    const existingBinItem = await prisma.binItem.findFirst({
      where: { binId, itemId }
    });

    if (existingBinItem) {
      await prisma.binItem.update({
        where: { id: existingBinItem.id },
        data: { quantity: existingBinItem.quantity + quantity }
      });
    } else {
      await prisma.binItem.create({
        data: {
          id: randomUUID(),
          binId,
          itemId,
          quantity
        }
      });
    }

    await prisma.bin.update({
      where: { id: binId },
      data: { currentLoad: { increment: quantity } }
    });

    return { success: true, placedQuantity: quantity };
  }

  private async executeScan(command: any) {
    const { barcode } = command.parameters;
    
    // Try to find item, bin, or shipment with this barcode
    const [item, bin, shipment] = await Promise.all([
      prisma.item.findUnique({ where: { barcode } }),
      prisma.bin.findUnique({ where: { barcode } }),
      prisma.shipment.findUnique({ where: { barcode } })
    ]);

    const result = item || bin || shipment;
    
    if (!result) {
      throw new Error('Barcode not found');
    }

    return { 
      success: true, 
      type: item ? 'item' : bin ? 'bin' : 'shipment',
      data: result 
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

  async getAvailableRobots(zoneId?: string) {
    return await prisma.robot.findMany({
      where: {
        status: 'IDLE',
        ...(zoneId && { zoneId })
      },
      include: {
        zone: true
      }
    });
  }

  async getRobotStatus(robotId: string) {
    const robot = await prisma.robot.findUnique({
      where: { id: robotId },
      include: {
        commands: {
          where: {
            status: { in: ['PENDING', 'EXECUTING'] }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!robot) {
      throw new Error('Robot not found');
    }

    return {
      robot,
      queueLength: robot.commands.length,
      estimatedIdleTime: this.calculateEstimatedIdleTime(robot.commands)
    };
  }

  private calculateEstimatedIdleTime(robot_commands: any[]): number {
    return robot_commands.reduce((total, cmd) => {
      // Estimate based on command type
      const estimates = {
        'MOVE': 2,
        'PICK': 1,
        'PLACE': 1,
        'SCAN': 0.5,
        'CALIBRATE': 5
      };
      return total + (estimates[cmd.type as keyof typeof estimates] || 2);
    }, 0);
  }
}