'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import {
  CheckCircle, AlertTriangle, TrendingUp, Globe, Calendar,
  Award, Package, Target, BookOpen
} from 'lucide-react';

interface DashboardData {
  kpis: {
    certificationRate: number;
    complianceScore: number;
    renewalsNeeded: number;
    highRiskRenewals: number;
    totalProducts: number;
    certifiedProducts: number;
  };
  complianceTrends: Array<{
    month: string;
    certificationRate: number;
    complianceScore: number;
    renewalRate: number;
  }>;
  renewalPredictions: Array<{
    certificateId: string;
    productName: string;
    daysUntilExpiry: number;
    riskLevel: string;
  }>;
  marketInsights: {
    topGrowthCategories: string[];
    seasonalTrends: {
      current: string;
      upcoming: string;
      impactFactor: number;
    };
  };
}

export default function HalalDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedRegion]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = selectedRegion !== 'all' ? `?region=${selectedRegion}` : '';
      const response = await fetch(`/api/halal/dashboard${params}`);
      
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      
      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading Halal Dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!dashboardData) return null;

  const { kpis, complianceTrends, renewalPredictions, marketInsights } = dashboardData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Halal Products Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time analytics and business intelligence for Halal supply chain management
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="MIDDLE_EAST">Middle East</SelectItem>
              <SelectItem value="SOUTHEAST_ASIA">Southeast Asia</SelectItem>
              <SelectItem value="EUROPE">Europe</SelectItem>
              <SelectItem value="NORTH_AMERICA">North America</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Educational Guide
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{Math.round(kpis.certificationRate)}%</p>
                <p className="text-sm text-muted-foreground">Certification Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{Math.round(kpis.complianceScore)}%</p>
                <p className="text-sm text-muted-foreground">Compliance Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{kpis.totalProducts}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{kpis.certifiedProducts}</p>
                <p className="text-sm text-muted-foreground">Certified Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{kpis.renewalsNeeded}</p>
                <p className="text-sm text-muted-foreground">Renewals Due</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{kpis.highRiskRenewals}</p>
                <p className="text-sm text-muted-foreground">High Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compliance">Compliance Analytics</TabsTrigger>
          <TabsTrigger value="market">Market Intelligence</TabsTrigger>
          <TabsTrigger value="renewals">Certification Management</TabsTrigger>
          <TabsTrigger value="simulation">Business Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trends</CardTitle>
              <CardDescription>Monthly compliance and certification metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={complianceTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="certificationRate" stroke="#8884d8" name="Certification Rate %" />
                  <Line type="monotone" dataKey="complianceScore" stroke="#82ca9d" name="Compliance Score %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Growth Categories</CardTitle>
              <CardDescription>Fastest growing Halal product categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {marketInsights.topGrowthCategories.map((category, index) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="font-medium">{category}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${100 - index * 20}%` }}
                        />
                      </div>
                      <span className="text-sm text-green-600">+{20 - index * 3}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certification Renewal Pipeline</CardTitle>
              <CardDescription>Upcoming renewals requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {renewalPredictions.slice(0, 8).map((renewal) => (
                  <div key={renewal.certificateId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{renewal.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        Certificate: {renewal.certificateId}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">{renewal.daysUntilExpiry} days</p>
                        <p className="text-xs text-muted-foreground">until expiry</p>
                      </div>
                      <Badge 
                        className={
                          renewal.riskLevel === 'HIGH' ? 'bg-red-500' :
                          renewal.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-green-500'
                        }
                      >
                        {renewal.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Scenario Simulator</CardTitle>
                <CardDescription>Model what-if scenarios for strategic planning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Market Expansion Simulation
                </Button>
                <Button className="w-full" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Seasonal Demand Modeling
                </Button>
                <Button className="w-full" variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Certification Delay Impact
                </Button>
                <Button className="w-full" variant="outline">
                  <Globe className="h-4 w-4 mr-2" />
                  Regional Compliance Analysis
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Educational Resources</CardTitle>
                <CardDescription>Learn about Halal business best practices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900">Certification Process</h4>
                  <p className="text-sm text-blue-600">30-90 days timeline, $500-$5K cost</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900">Compliance Requirements</h4>
                  <p className="text-sm text-green-600">Ingredient verification, process control</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900">Market Opportunities</h4>
                  <p className="text-sm text-purple-600">$2.3T global market, 6.2% growth</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}