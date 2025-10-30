import { PrismaClient } from '@prisma/client';
import { InventoryAlert, SensorAlert } from '../types';

const prisma = new PrismaClient();

export class AlertingService {
  async checkInventoryAlerts(): Promise<InventoryAlert[]> {
    const alerts: InventoryAlert[] = [];

    const lowStockAlerts = await this.checkLowStock();
    alerts.push(...lowStockAlerts);

    const expiryAlerts = await this.checkExpiryWarnings();
    alerts.push(...expiryAlerts);

    const overstockAlerts = await this.checkOverstock();
    alerts.push(...overstockAlerts);

    return alerts;
  }

  private async checkLowStock(): Promise<InventoryAlert[]> {
    const items = await prisma.items.findMany({
      where: {
        minStock: { gt: 0 },
      },
      include: {
        bin_items: {
          select: { quantity: true },
        },
      },
    });

    return items
      .map((item) => {
        const totalQuantity = item.bin_items.reduce(
          (sum, bi) => sum + bi.quantity,
          0,
        );

        if (totalQuantity <= item.minStock) {
          return {
            id: `low-stock-${item.id}`,
            type: 'LOW_STOCK' as const,
            severity:
              totalQuantity === 0
                ? ('CRITICAL' as const)
                : ('WARNING' as const),
            itemId: item.id,
            message: `${item.name} (${item.sku}) is below minimum stock level`,
            threshold: item.minStock,
            currentValue: totalQuantity,
            createdAt: new Date(),
          };
        }
        return null;
      })
      .filter(Boolean) as InventoryAlert[];
  }

  private async checkExpiryWarnings(): Promise<InventoryAlert[]> {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringItems = await prisma.bin_items.findMany({
      where: {
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
      include: {
        items: true,
        bins: true,
      },
    });

    return expiringItems.map((binItem) => {
      const daysUntilExpiry = Math.ceil(
        (binItem.expiryDate!.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return {
        id: `expiry-${binItem.id}`,
        type: 'EXPIRY_WARNING' as const,
        severity:
          daysUntilExpiry <= 7 ? ('CRITICAL' as const) : ('WARNING' as const),
        itemId: binItem.itemId,
        binId: binItem.binId,
        message: `${binItem.items.name} in ${binItem.bins.code} expires in ${daysUntilExpiry} days`,
        threshold: 30,
        currentValue: daysUntilExpiry,
        createdAt: new Date(),
      };
    });
  }

  private async checkOverstock(): Promise<InventoryAlert[]> {
    const items = await prisma.items.findMany({
      where: {
        maxStock: { not: null },
      },
      include: {
        bin_items: {
          select: { quantity: true },
        },
      },
    });

    return items
      .map((item) => {
        const totalQuantity = item.bin_items.reduce(
          (sum, bi) => sum + bi.quantity,
          0,
        );

        if (item.maxStock && totalQuantity > item.maxStock) {
          return {
            id: `overstock-${item.id}`,
            type: 'OVERSTOCK' as const,
            severity: 'WARNING' as const,
            itemId: item.id,
            message: `${item.name} (${item.sku}) exceeds maximum stock level`,
            threshold: item.maxStock,
            currentValue: totalQuantity,
            createdAt: new Date(),
          };
        }
        return null;
      })
      .filter(Boolean) as InventoryAlert[];
  }

  async checkSensorAlerts(): Promise<SensorAlert[]> {
    const alerts: SensorAlert[] = [];

    const sensors = await prisma.sensors.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        sensor_readings: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    for (const sensor of sensors) {
      const latestReading = sensor.sensor_readings[0];

      if (!latestReading) {
        alerts.push({
          id: `offline-${sensor.id}`,
          sensorId: sensor.id,
          type: 'SENSOR_OFFLINE',
          severity: 'CRITICAL',
          value: 0,
          threshold: 0,
          message: `Sensor ${sensor.name} (${sensor.code}) is offline - no recent readings`,
          createdAt: new Date(),
        });
        continue;
      }

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (latestReading.timestamp < oneHourAgo) {
        alerts.push({
          id: `offline-${sensor.id}`,
          sensorId: sensor.id,
          type: 'SENSOR_OFFLINE',
          severity: 'WARNING',
          value: 0,
          threshold: 60,
          message: `Sensor ${sensor.name} (${sensor.code}) has not reported for over 1 hour`,
          createdAt: new Date(),
        });
      }

      if (
        sensor.thresholdMin !== null &&
        latestReading.value < sensor.thresholdMin
      ) {
        alerts.push({
          id: `threshold-min-${sensor.id}`,
          sensorId: sensor.id,
          type: 'THRESHOLD_EXCEEDED',
          severity: 'WARNING',
          value: latestReading.value,
          threshold: sensor.thresholdMin,
          message: `${sensor.name} reading (${latestReading.value}${latestReading.unit}) below minimum threshold`,
          createdAt: new Date(),
        });
      }

      if (
        sensor.thresholdMax !== null &&
        latestReading.value > sensor.thresholdMax
      ) {
        alerts.push({
          id: `threshold-max-${sensor.id}`,
          sensorId: sensor.id,
          type: 'THRESHOLD_EXCEEDED',
          severity: 'CRITICAL',
          value: latestReading.value,
          threshold: sensor.thresholdMax,
          message: `${sensor.name} reading (${latestReading.value}${latestReading.unit}) exceeds maximum threshold`,
          createdAt: new Date(),
        });
      }
    }

    return alerts;
  }

  async getAllAlerts() {
    const [inventoryAlerts, sensorAlerts] = await Promise.all([
      this.checkInventoryAlerts(),
      this.checkSensorAlerts(),
    ]);

    return {
      inventory: inventoryAlerts,
      sensors: sensorAlerts,
      summary: {
        total: inventoryAlerts.length + sensorAlerts.length,
        critical: [...inventoryAlerts, ...sensorAlerts].filter(
          (a) => a.severity === 'CRITICAL',
        ).length,
        warning: [...inventoryAlerts, ...sensorAlerts].filter(
          (a) => a.severity === 'WARNING',
        ).length,
        info: [...inventoryAlerts, ...sensorAlerts].filter(
          (a) => a.severity === 'INFO',
        ).length,
      },
    };
  }
}
