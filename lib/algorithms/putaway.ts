import { randomUUID } from "crypto";
import { prisma } from '@/lib/db';
import { PutawayRequest, PutawayResult } from '@/lib/types';

export class PutawayOptimizer {
  async findOptimalLocation(request: PutawayRequest): Promise<PutawayResult | null> {
    const items = await prisma.item.findUnique({
      where: { id: request.itemId },
      include: { supplier: true }
    });

    if (!items) throw new Error('Item not found');

    const availableBins = await this.getAvailableBins(request, items);
    
    if (availableBins.length === 0) return null;

    const scoredBins = await Promise.all(
      availableBins.map(bin => this.scoreBin(bin, request, items))
    );

    scoredBins.sort((a, b) => b.score - a.score);
    return scoredBins[0];
  }

  private async getAvailableBins(request: PutawayRequest, items: any) {
    return await prisma.bin.findMany({
      where: {
        status: 'ACTIVE',
        rack: {
          aisle: {
            zone: {
              temperature: request.constraints?.temperature || items.temperature
            }
          }
        }
      },
      include: {
        rack: {
          include: {
            aisle: {
              include: { zone: true }
            }
          }
        },
        binItems: {
          include: { item: true }
        }
      }
    });
  }

  private async scoreBin(bin: any, request: PutawayRequest, items: any): Promise<PutawayResult> {
    let score = 0;
    const reasons: string[] = [];

    const remainingCapacity = bin.capacity - bin.currentLoad;
    const utilizationScore = (remainingCapacity >= request.quantity) ? 
      (1 - (remainingCapacity - request.quantity) / bin.capacity) * 30 : 0;
    score += utilizationScore;
    if (utilizationScore > 20) reasons.push('Good capacity utilization');

    const compatibilityScore = this.calculateCompatibility(bin, items);
    score += compatibilityScore * 25;
    if (compatibilityScore > 0.8) reasons.push('High items compatibility');

    const zoneScore = await this.calculateZoneEfficiency(bin.rack.aisle.zone);
    score += zoneScore * 20;
    if (zoneScore > 0.7) reasons.push('Efficient zone placement');

    const accessibilityScore = this.calculateAccessibility(bin);
    score += accessibilityScore * 15;
    if (accessibilityScore > 0.8) reasons.push('Easy access location');

    const fifoScore = this.calculateFIFOScore(bin, request);
    score += fifoScore * 10;
    if (fifoScore > 0.8) reasons.push('FIFO compliant');

    return {
      binId: bin.id,
      binCode: bin.code,
      location: `${bin.rack.aisle.zone.code}-${bin.rack.aisle.code}-${bin.rack.code}-${bin.code}`,
      score: Math.round(score * 100) / 100,
      reasons
    };
  }

  private calculateCompatibility(bin: any, items: any): number {
    const hasSameItem = bin.binItems.some((bi: any) => bi.item.id === items.id);
    if (hasSameItem) return 1.0;

    const categories = bin.binItems.map((bi: any) => bi.item.category);
    const uniqueCategories = new Set(categories);
    
    if (uniqueCategories.size === 0) return 0.9;
    if (uniqueCategories.has(items.category)) return 0.8;
    if (uniqueCategories.size < 3) return 0.6;
    
    return 0.3;
  }

  private async calculateZoneEfficiency(zones: any): Promise<number> {
    const zoneBins = await prisma.bin.count({
      where: {
        rack: {
          aisle: {
            zoneId: zones.id
          }
        }
      }
    });

    const activeBins = await prisma.bin.count({
      where: {
        rack: {
          aisle: {
            zoneId: zones.id
          }
        },
        currentLoad: { gt: 0 }
      }
    });

    return zoneBins > 0 ? (activeBins / zoneBins) : 0;
  }

  private calculateAccessibility(bin: any): number {
    const maxLevel = 10;
    const levelScore = (maxLevel - bin.rack.level) / maxLevel;
    const widthScore = Math.min(bin.rack.aisle.width / 3.0, 1.0);
    
    return (levelScore + widthScore) / 2;
  }

  private calculateFIFOScore(bin: any, request: PutawayRequest): number {
    if (!request.expiryDate) return 1.0;

    const existingItems = bin.binItems.filter((bi: any) => bi.expiryDate);
    if (existingItems.length === 0) return 1.0;

    const allExpiryDatesLater = existingItems.every((bi: any) => 
      new Date(bi.expiryDate) <= request.expiryDate!
    );

    return allExpiryDatesLater ? 1.0 : 0.2;
  }

  async executePutaway(request: PutawayRequest, binId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      const existingBinItem = await tx.binItem.findFirst({
        where: {
          binId,
          itemId: request.itemId,
          batchNumber: request.batchNumber || null
        }
      });

      let binItem;
      if (existingBinItem) {
        binItem = await tx.binItem.update({
          where: { id: existingBinItem.id },
          data: {
            quantity: existingBinItem.quantity + request.quantity
          }
        });
      } else {
        binItem = await tx.binItem.create({
          data: {
            id: randomUUID(),
            binId,
            itemId: request.itemId,
            quantity: request.quantity,
            batchNumber: request.batchNumber,
            expiryDate: request.expiryDate
          }
        });
      }

      await tx.bin.update({
        where: { id: binId },
        data: {
          currentLoad: {
            increment: request.quantity
          }
        }
      });

      const movement = await tx.movement.create({
        data: {
          id: randomUUID(),
          type: 'PUTAWAY',
          quantity: request.quantity,
          status: 'COMPLETED',
          priority: request.priority,
          binItemId: binItem.id,
          toBinId: binId,
          userId
        }
      });

      return { binItem, movement };
    });
  }
}