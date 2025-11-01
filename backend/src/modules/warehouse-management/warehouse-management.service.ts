import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class WarehouseManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async getWarehouses() {
    return this.prisma.warehouse.findMany({
      include: {
        zones: {
          include: {
            aisles: {
              include: {
                racks: {
                  include: {
                    bins: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  async getZones(warehouseId: string) {
    return this.prisma.zone.findMany({
      where: { warehouseId },
      include: {
        aisles: {
          include: {
            racks: {
              include: {
                bins: {
                  include: {
                    binItems: {
                      include: {
                        item: true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        sensors: true,
        robots: true
      }
    });
  }

  async getCapacity(warehouseId: string) {
    const zones = await this.prisma.zone.findMany({
      where: { warehouseId },
      include: {
        aisles: {
          include: {
            racks: {
              include: {
                bins: true
              }
            }
          }
        }
      }
    });

    const totalCapacity = zones.reduce((total, zone) => {
      return total + zone.aisles.reduce((zoneTotal, aisle) => {
        return zoneTotal + aisle.racks.reduce((aisleTotal, rack) => {
          return aisleTotal + rack.bins.reduce((rackTotal, bin) => {
            return rackTotal + bin.capacity;
          }, 0);
        }, 0);
      }, 0);
    }, 0);

    const currentLoad = zones.reduce((total, zone) => {
      return total + zone.aisles.reduce((zoneTotal, aisle) => {
        return zoneTotal + aisle.racks.reduce((aisleTotal, rack) => {
          return aisleTotal + rack.bins.reduce((rackTotal, bin) => {
            return rackTotal + bin.currentLoad;
          }, 0);
        }, 0);
      }, 0);
    }, 0);

    return {
      totalCapacity,
      currentLoad,
      availableCapacity: totalCapacity - currentLoad,
      utilizationRate: totalCapacity > 0 ? (currentLoad / totalCapacity) * 100 : 0
    };
  }

  async getUtilization(warehouseId?: string) {
    const whereClause = warehouseId ? { warehouseId } : {};
    
    const zones = await this.prisma.zone.findMany({
      where: whereClause,
      include: {
        aisles: {
          include: {
            racks: {
              include: {
                bins: true
              }
            }
          }
        }
      }
    });

    return zones.map(zone => ({
      zoneId: zone.id,
      zoneName: zone.name,
      temperature: zone.temperature,
      utilization: this.calculateZoneUtilization(zone)
    }));
  }

  private calculateZoneUtilization(zone: any) {
    const totalCapacity = zone.aisles.reduce((total: number, aisle: any) => {
      return total + aisle.racks.reduce((aisleTotal: number, rack: any) => {
        return aisleTotal + rack.bins.reduce((rackTotal: number, bin: any) => {
          return rackTotal + bin.capacity;
        }, 0);
      }, 0);
    }, 0);

    const currentLoad = zone.aisles.reduce((total: number, aisle: any) => {
      return total + aisle.racks.reduce((aisleTotal: number, rack: any) => {
        return aisleTotal + rack.bins.reduce((rackTotal: number, bin: any) => {
          return rackTotal + bin.currentLoad;
        }, 0);
      }, 0);
    }, 0);

    return {
      totalCapacity,
      currentLoad,
      utilizationRate: totalCapacity > 0 ? (currentLoad / totalCapacity) * 100 : 0
    };
  }

  async optimizeLayout(warehouseId: string) {
    // Basic layout optimization logic
    const zones = await this.getZones(warehouseId);
    
    const recommendations = zones.map(zone => {
      const utilization = this.calculateZoneUtilization(zone);
      
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        currentUtilization: utilization.utilizationRate,
        recommendations: this.generateRecommendations(utilization.utilizationRate)
      };
    });

    return {
      warehouseId,
      optimizationDate: new Date(),
      recommendations
    };
  }

  private generateRecommendations(utilizationRate: number) {
    const recommendations = [];
    
    if (utilizationRate > 90) {
      recommendations.push('Consider expanding storage capacity');
      recommendations.push('Implement vertical storage solutions');
    } else if (utilizationRate < 30) {
      recommendations.push('Consolidate inventory to reduce operational costs');
      recommendations.push('Consider reallocating space for other operations');
    } else if (utilizationRate > 70) {
      recommendations.push('Monitor closely for capacity planning');
    }

    return recommendations;
  }
}