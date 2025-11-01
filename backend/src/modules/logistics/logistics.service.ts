import { Injectable } from '@nestjs/common';

@Injectable()
export class LogisticsService {
  private data: any[] = [];

  findAll(query?: any) {
    return [
      {
        id: '1',
        vehicleId: 'VH-001',
        driverId: 'DR-001',
        route: 'Route A',
        status: 'ACTIVE',
        currentLocation: 'Warehouse District',
        capacity: 1000,
        currentLoad: 750,
        fuelLevel: 85
      },
      {
        id: '2',
        vehicleId: 'VH-002',
        driverId: 'DR-002',
        route: 'Route B',
        status: 'MAINTENANCE',
        currentLocation: 'Service Center',
        capacity: 800,
        currentLoad: 0,
        fuelLevel: 45
      }
    ];
  }

  getFleetMetrics() {
    const fleet = this.findAll();
    return {
      totalVehicles: fleet.length,
      activeVehicles: fleet.filter(v => v.status === 'ACTIVE').length,
      totalCapacity: fleet.reduce((sum, v) => sum + v.capacity, 0),
      currentLoad: fleet.reduce((sum, v) => sum + v.currentLoad, 0),
      averageFuel: Math.round(fleet.reduce((sum, v) => sum + v.fuelLevel, 0) / fleet.length)
    };
  }

  optimizeRoutes(data: any) {
    return {
      optimizedRoutes: [
        {
          routeId: 'OPT-001',
          vehicles: ['VH-001', 'VH-003'],
          estimatedTime: 240,
          fuelSavings: 15.5,
          stops: 8
        }
      ],
      totalSavings: {
        time: 45,
        fuel: 15.5,
        distance: 25.2
      }
    };
  }

  trackShipment(trackingNumber: string) {
    return {
      trackingNumber,
      status: 'IN_TRANSIT',
      currentLocation: 'Distribution Hub',
      estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
      route: 'Route A',
      vehicleId: 'VH-001'
    };
  }

  findOne(id: string) {
    return this.data.find(item => item.id === id);
  }

  create(createDto: any) {
    const newItem = {
      id: Date.now().toString(),
      ...createDto,
      createdAt: new Date().toISOString()
    };
    this.data.push(newItem);
    return newItem;
  }

  update(id: string, updateDto: any) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      this.data[index] = { ...this.data[index], ...updateDto, updatedAt: new Date().toISOString() };
      return this.data[index];
    }
    return null;
  }

  remove(id: string) {
    const index = this.data.findIndex(item => item.id === id);
    if (index !== -1) {
      return this.data.splice(index, 1)[0];
    }
    return null;
  }
}