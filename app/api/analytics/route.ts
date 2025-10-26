 import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (period === '7d') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(now.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(now.getDate() - 90);
    }

    // Get total items count
    const totalItems = await prisma.item.count();

    // Get active bins count
    const activeBins = await prisma.bin.count({
      where: {
        status: 'ACTIVE'
      }
    });

    // Get today's movements count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysMovements = await prisma.movement.count({
      where: {
        timestamp: {
          gte: today,
          lt: tomorrow
        }
      }
    });

    // Get pending tasks (pending movements)
    const pendingTasks = await prisma.movement.count({
      where: {
        status: 'PENDING'
      }
    });

    // Get inventory turnover (simplified - movements in period / average inventory)
    const periodMovements = await prisma.movement.aggregate({
      where: {
        timestamp: {
          gte: startDate
        },
        status: 'COMPLETED'
      },
      _sum: {
        quantity: true
      }
    });

    // Calculate space utilization
    const binsWithLoad = await prisma.bin.findMany({
      select: {
        capacity: true,
        currentLoad: true
      }
    });

    const totalCapacity = binsWithLoad.reduce((sum, bin) => sum + bin.capacity, 0);
    const totalCurrentLoad = binsWithLoad.reduce((sum, bin) => sum + bin.currentLoad, 0);
    const spaceUtilization = totalCapacity > 0 ? (totalCurrentLoad / totalCapacity) * 100 : 0;

    // Get low stock alerts
    const lowStockItems = await prisma.item.findMany({
      where: {
        minStock: {
          gt: 0
        }
      },
      include: {
        binItems: {
          select: {
            quantity: true
          }
        }
      }
    });

    const stockAlerts = lowStockItems
      .map(item => {
        const totalQuantity = item.binItems.reduce((sum, binItem) => sum + binItem.quantity, 0);
        return {
          id: item.id,
          sku: item.sku,
          name: item.name,
          currentStock: totalQuantity,
          minStock: item.minStock,
          status: totalQuantity <= item.minStock ? 'LOW_STOCK' : 'OK'
        };
      })
      .filter(item => item.status === 'LOW_STOCK');

    // Get movement trends (last 7 days)
    const movementTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const count = await prisma.movement.count({
        where: {
          timestamp: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: 'COMPLETED'
        }
      });

      movementTrends.push({
        date: date.toISOString().split('T')[0],
        movements: count
      });
    }

    const analytics = {
      summary: {
        totalItems,
        activeBins,
        todaysMovements,
        pendingTasks
      },
      kpis: {
        inventoryTurnover: periodMovements._sum.quantity || 0,
        spaceUtilization: Math.round(spaceUtilization * 100) / 100,
        stockAlertsCount: stockAlerts.length
      },
      alerts: stockAlerts,
      trends: movementTrends
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
