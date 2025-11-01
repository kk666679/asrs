import { prisma } from '@/lib/db';
import { randomUUID } from 'crypto';
import { PickingRequest, PickingRoute, OptimizedPickingPlan } from '@/lib/types';

export class PickingOptimizer {
  async generateOptimizedPlan(request: PickingRequest): Promise<OptimizedPickingPlan> {
    const pickingTasks = await this.createPickingTasks(request);
    const optimizedRoutes = await this.optimizeRoutes(pickingTasks);
    
    return {
      routes: optimizedRoutes,
      totalDistance: this.calculateTotalDistance(optimizedRoutes),
      estimatedTime: this.calculateEstimatedTime(optimizedRoutes),
      efficiency: this.calculateEfficiency(optimizedRoutes)
    };
  }

  private async createPickingTasks(request: PickingRequest) {
    const tasks = [];
    
    for (const requestItem of request.items) {
      const binItems = await prisma.binItem.findMany({
        where: {
          itemId: requestItem.itemId,
          quantity: { gt: 0 }
        },
        include: {
          bin: {
            include: {
              rack: {
                include: {
                  aisle: {
                    include: { zone: true }
                  }
                }
              }
            }
          },
          item: true
        },
        orderBy: [
          { expiryDate: 'asc' }, // FIFO
          { bin: { rack: { level: 'asc' } } } // Lower levels first
        ]
      });

      let remainingQuantity = requestItem.quantity;
      
      for (const binItem of binItems) {
        if (remainingQuantity <= 0) break;
        
        const pickQuantity = Math.min(remainingQuantity, binItem.quantity);
        
        tasks.push({
          itemId: requestItem.itemId,
          binId: binItem.binId,
          binCode: binItem.bin.code,
          quantity: pickQuantity,
          priority: requestItem.priority,
          location: this.formatLocation(binItem.bin),
          coordinates: this.getBinCoordinates(binItem.bin),
          weight: binItem.item.weight * pickQuantity
        });
        
        remainingQuantity -= pickQuantity;
      }
      
      if (remainingQuantity > 0) {
        throw new Error(`Insufficient stock for item ${requestItem.itemId}. Missing: ${remainingQuantity}`);
      }
    }
    
    return tasks;
  }

  private async optimizeRoutes(tasks: any[]): Promise<PickingRoute[]> {
    // Sort by priority first, then optimize by location
    const prioritizedTasks = tasks.sort((a, b) => {
      const priorityOrder: Record<string, number> = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    });

    // Group by zone for efficient routing
    const tasksByZone = this.groupTasksByZone(prioritizedTasks);
    
    const optimizedRoutes: PickingRoute[] = [];
    let sequence = 1;
    let currentPosition = { x: 0, y: 0, z: 0 }; // Starting position
    
    for (const [zoneId, zoneTasks] of Object.entries(tasksByZone)) {
      // Optimize within zone using nearest neighbor algorithm
      const optimizedZoneTasks = this.optimizeWithinZone(zoneTasks as any[], currentPosition);
      
      for (const task of optimizedZoneTasks) {
        const distance = this.calculateDistance(currentPosition, task.coordinates);
        const estimatedTime = this.calculatePickTime(task, distance);
        
        optimizedRoutes.push({
          sequence: sequence++,
          binId: task.binId,
          binCode: task.binCode,
          itemId: task.itemId,
          quantity: task.quantity,
          location: task.location,
          estimatedTime,
          distance
        });
        
        currentPosition = task.coordinates;
      }
    }
    
    return optimizedRoutes;
  }

  private groupTasksByZone(tasks: any[]) {
    return tasks.reduce((groups, task) => {
      const zoneId = task.location.split('-')[0];
      if (!groups[zoneId]) groups[zoneId] = [];
      groups[zoneId].push(task);
      return groups;
    }, {});
  }

  private optimizeWithinZone(tasks: any[], startPosition: any) {
    if (tasks.length <= 1) return tasks;
    
    // Nearest neighbor algorithm for TSP approximation
    const optimized = [];
    let currentPos = startPosition;
    let remaining = [...tasks];
    
    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = this.calculateDistance(currentPos, remaining[0].coordinates);
      
      for (let i = 1; i < remaining.length; i++) {
        const distance = this.calculateDistance(currentPos, remaining[i].coordinates);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }
      
      const nearestTask = remaining.splice(nearestIndex, 1)[0];
      optimized.push(nearestTask);
      currentPos = nearestTask.coordinates;
    }
    
    return optimized;
  }

  private getBinCoordinates(bin: any) {
    // Convert bin location to 3D coordinates
    return {
      x: bin.rack.aisle.number * 10, // Aisle spacing
      y: bin.rack.level * 2, // Level height
      z: parseInt(bin.code.slice(-2)) * 1.5 // Bin position in rack
    };
  }

  private calculateDistance(pos1: any, pos2: any): number {
    return Math.sqrt(
      Math.pow(pos2.x - pos1.x, 2) +
      Math.pow(pos2.y - pos1.y, 2) +
      Math.pow(pos2.z - pos1.z, 2)
    );
  }

  private calculatePickTime(task: any, distance: number): number {
    const travelTime = distance * 0.1; // 0.1 min per unit distance
    const pickTime = 0.5; // Base pick time
    const weightFactor = Math.min(task.weight * 0.01, 0.3); // Weight penalty
    
    return travelTime + pickTime + weightFactor;
  }

  private calculateTotalDistance(routes: PickingRoute[]): number {
    return routes.reduce((total, route) => total + route.distance, 0);
  }

  private calculateEstimatedTime(routes: PickingRoute[]): number {
    return routes.reduce((total, route) => total + route.estimatedTime, 0);
  }

  private calculateEfficiency(routes: PickingRoute[]): number {
    if (routes.length === 0) return 0;
    
    const totalDistance = this.calculateTotalDistance(routes);
    const directDistance = routes.length * 5; // Theoretical minimum
    
    return Math.max(0, Math.min(100, (directDistance / totalDistance) * 100));
  }

  private formatLocation(bin: any): string {
    return `${bin.rack.aisle.zone.code}-${bin.rack.aisle.code}-${bin.rack.code}-${bin.code}`;
  }

  async executePicking(routes: PickingRoute[], userId: string) {
    return await prisma.$transaction(async (tx) => {
      const movements = [];
      
      for (const route of routes) {
        const binItem = await tx.binItem.findFirst({
          where: {
            binId: route.binId,
            itemId: route.itemId
          }
        });
        
        if (!binItem || binItem.quantity < route.quantity) {
          throw new Error(`Insufficient quantity in bin ${route.binCode}`);
        }
        
        // Update bin item quantity
        await tx.binItem.update({
          where: { id: binItem.id },
          data: {
            quantity: binItem.quantity - route.quantity
          }
        });

        // Update bin current load
        await tx.bin.update({
          where: { id: route.binId },
          data: {
            currentLoad: {
              decrement: route.quantity
            }
          }
        });

        // Create movement record
        const movement = await tx.movement.create({
          data: {
            id: randomUUID(),
            type: 'PICKING',
            quantity: route.quantity,
            status: 'COMPLETED',
            priority: 'MEDIUM',
            binItemId: binItem.id,
            fromBinId: route.binId,
            userId
          }
        });
        
        movements.push(movement);
      }
      
      return movements;
    });
  }
}