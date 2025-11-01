import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  getAnalytics(period?: string) {
    return {
      summary: {
        totalItems: 1250,
        activeBins: 890,
        todaysMovements: 342,
        pendingTasks: 15
      },
      kpis: {
        inventoryTurnover: 4.2,
        spaceUtilization: 87,
        stockAlertsCount: 3
      },
      alerts: [
        {
          id: '1',
          sku: 'SKU001',
          name: 'Organic Rice',
          currentStock: 5,
          minStock: 10,
          status: 'LOW_STOCK'
        }
      ],
      trends: [
        { date: '2024-01-01', movements: 120 },
        { date: '2024-01-02', movements: 145 },
        { date: '2024-01-03', movements: 132 }
      ]
    };
  }
}