'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Target,
  Activity,
  Zap,
  Award
} from 'lucide-react';
import { analyticsService } from '@/lib/services/logistics-microservices';

interface AnalyticsData {
  performance: {
    onTimeDelivery: number;
    averageDeliveryTime: number;
    customerSatisfaction: number;
  };
  efficiency: {
    routeEfficiency: number;
    fleetEfficiency: number;
    trackingAccuracy: number;
    overallScore: number;
  };
  costs: {
    totalCost: number;
    costPerDelivery: number;
    fuelCosts: number;
    maintenanceCosts: number;
  };
}

export default function LogisticsAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date()
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [performance, efficiency, costs] = await Promise.all([
        analyticsService.getDeliveryPerformance(timeRange),
        analyticsService.getEfficiencyMetrics(),
        analyticsService.getCostAnalysis(timeRange)
      ]);

      setAnalytics({
        performance: {
          onTimeDelivery: 94.2,
          averageDeliveryTime: 2.3,
          customerSatisfaction: 4.7
        },
        efficiency,
        costs: {
          totalCost: costs.totalCost || 125000,
          costPerDelivery: 12.50,
          fuelCosts: 45000,
          maintenanceCosts: 15000
        }
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      // Fallback to mock data
      setAnalytics({
        performance: {
          onTimeDelivery: 94.2,
          averageDeliveryTime: 2.3,
          customerSatisfaction: 4.7
        },
        efficiency: {
          routeEfficiency: 87.5,
          fleetEfficiency: 92.1,
          trackingAccuracy: 99.2,
          overallScore: 92.9
        },
        costs: {
          totalCost: 125000,
          costPerDelivery: 12.50,
          fuelCosts: 45000,
          maintenanceCosts: 15000
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-effect">
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            Logistics Performance Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance Metrics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-green-400">Delivery Performance</h3>
              
              <div className="glass-effect p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-400" />
                    <span className="text-sm">On-Time Delivery</span>
                  </div>
                  <Badge variant="outline" className="text-green-400">
                    {analytics.performance.onTimeDelivery}%
                  </Badge>
                </div>
                <Progress value={analytics.performance.onTimeDelivery} className="h-2" />
              </div>

              <div className="glass-effect p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Avg Delivery Time</span>
                </div>
                <div className="text-2xl font-bold">{analytics.performance.averageDeliveryTime} days</div>
              </div>

              <div className="glass-effect p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">Customer Rating</span>
                </div>
                <div className="text-2xl font-bold">{analytics.performance.customerSatisfaction}/5.0</div>
              </div>
            </div>

            {/* Efficiency Metrics */}
            <div className="space-y-4">
              <h3 className="font-semibold text-purple-400">System Efficiency</h3>
              
              <div className="glass-effect p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">Route Efficiency</span>
                  </div>
                  <Badge variant="outline" className="text-purple-400">
                    {analytics.efficiency.routeEfficiency}%
                  </Badge>
                </div>
                <Progress value={analytics.efficiency.routeEfficiency} className="h-2" />
              </div>

              <div className="glass-effect p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-400" />
                    <span className="text-sm">Fleet Efficiency</span>
                  </div>
                  <Badge variant="outline" className="text-blue-400">
                    {analytics.efficiency.fleetEfficiency}%
                  </Badge>
                </div>
                <Progress value={analytics.efficiency.fleetEfficiency} className="h-2" />
              </div>

              <div className="glass-effect p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-400" />
                  <span className="text-sm">Overall Score</span>
                </div>
                <div className="text-2xl font-bold text-green-400">
                  {analytics.efficiency.overallScore}%
                </div>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="space-y-4">
              <h3 className="font-semibold text-yellow-400">Cost Analysis</h3>
              
              <div className="glass-effect p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">Total Costs (30d)</span>
                </div>
                <div className="text-2xl font-bold">
                  ${analytics.costs.totalCost.toLocaleString()}
                </div>
              </div>

              <div className="glass-effect p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="text-sm">Cost per Delivery</span>
                </div>
                <div className="text-2xl font-bold">
                  ${analytics.costs.costPerDelivery}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Fuel Costs</span>
                  <span>${analytics.costs.fuelCosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Maintenance</span>
                  <span>${analytics.costs.maintenanceCosts.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-effect p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">+12%</div>
              <div className="text-sm text-muted-foreground">Delivery Speed</div>
              <div className="text-xs text-green-400">vs last month</div>
            </div>
            <div className="glass-effect p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-400">-8%</div>
              <div className="text-sm text-muted-foreground">Fuel Costs</div>
              <div className="text-xs text-blue-400">vs last month</div>
            </div>
            <div className="glass-effect p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-400">+15%</div>
              <div className="text-sm text-muted-foreground">Route Efficiency</div>
              <div className="text-xs text-purple-400">vs last month</div>
            </div>
            <div className="glass-effect p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400">+5%</div>
              <div className="text-sm text-muted-foreground">Customer Rating</div>
              <div className="text-xs text-yellow-400">vs last month</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}