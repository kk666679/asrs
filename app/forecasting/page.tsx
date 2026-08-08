'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, ReferenceLine,
} from 'recharts';
import {
  TrendingUp, TrendingDown, Minus, BarChart3, AlertTriangle,
  Brain, RefreshCw, Layers, Target, Activity, Zap,
} from 'lucide-react';

interface ForecastPoint {
  date: string;
  predictedQuantity: number;
  confidence: number;
}

interface HistoricalPoint {
  date: string;
  quantity: number;
}

interface ForecastData {
  itemId: string;
  itemName: string;
  sku: string;
  historicalData: HistoricalPoint[];
  forecast: ForecastPoint[];
  accuracy: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface Item {
  id: string;
  name: string;
  sku: string;
}

const TREND_CONFIG = {
  increasing: { icon: TrendingUp, color: 'text-emerald-500', badge: 'bg-emerald-500', label: 'Increasing' },
  decreasing: { icon: TrendingDown, color: 'text-red-500', badge: 'bg-red-500', label: 'Decreasing' },
  stable: { icon: Minus, color: 'text-slate-500', badge: 'bg-slate-500', label: 'Stable' },
};

function KpiCard({ title, value, sub, icon: Icon, color }: { title: string; value: string; sub: string; icon: React.ElementType; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ForecastChart({ forecast, historicalData }: { forecast: ForecastPoint[]; historicalData: HistoricalPoint[] }) {
  const combined = [
    ...historicalData.slice(-14).map(d => ({ date: d.date, historical: d.quantity, predicted: null as number | null, confidence: null as number | null })),
    ...forecast.slice(0, 30).map(d => ({ date: d.date, historical: null as number | null, predicted: d.predictedQuantity, confidence: Math.round(d.confidence * 100) })),
  ];

  return (
    <ChartContainer config={{ historical: { label: 'Historical', color: '#6366f1' }, predicted: { label: 'Forecast', color: '#10b981' } }} className="h-64">
      <AreaChart data={combined}>
        <defs>
          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={v => v.slice(5)} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10 }} />
        <ChartTooltip content={(props) => <ChartTooltipContent {...(props as any)} indicator="line" />} />
        <ReferenceLine x={historicalData[historicalData.length - 1]?.date} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: 'Today', fontSize: 10 }} />
        <Area type="monotone" dataKey="historical" stroke="#6366f1" fill="url(#histGrad)" strokeWidth={2} dot={false} connectNulls={false} />
        <Area type="monotone" dataKey="predicted" stroke="#10b981" fill="url(#predGrad)" strokeWidth={2} dot={false} strokeDasharray="5 3" connectNulls={false} />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}

function ConfidenceChart({ forecast }: { forecast: ForecastPoint[] }) {
  const data = forecast.slice(0, 30).map(d => ({ date: d.date.slice(5), confidence: Math.round(d.confidence * 100) }));
  return (
    <ChartContainer config={{ confidence: { label: 'Confidence %', color: '#f59e0b' } }} className="h-48">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="date" tick={{ fontSize: 9 }} interval={4} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
        <ChartTooltip content={(props) => <ChartTooltipContent {...(props as any)} indicator="dot" />} />
        <Bar dataKey="confidence" fill="#f59e0b" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

function ComparisonChart({ forecasts }: { forecasts: ForecastData[] }) {
  const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const days = 14;
  const data = Array.from({ length: days }, (_, i) => {
    const point: Record<string, string | number> = { day: `Day ${i + 1}` };
    forecasts.forEach(f => { point[f.sku] = f.forecast[i]?.predictedQuantity ?? 0; });
    return point;
  });

  return (
    <ChartContainer
      config={Object.fromEntries(forecasts.map((f, i) => [f.sku, { label: f.itemName, color: colors[i % colors.length] }]))}
      className="h-64"
    >
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <ChartTooltip content={(props) => <ChartTooltipContent {...(props as any)} indicator="dot" />} />
        <ChartLegend content={<ChartLegendContent />} />
        {forecasts.map((f, i) => (
          <Line key={f.itemId} type="monotone" dataKey={f.sku} stroke={colors[i % colors.length]} strokeWidth={2} dot={false} />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export default function ForecastingPage() {
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [daysAhead, setDaysAhead] = useState(30);
  const [detailForecast, setDetailForecast] = useState<ForecastData | null>(null);

  const fetchItems = useCallback(async () => {
    setItemsLoading(true);
    try {
      const res = await fetch('/api/items');
      if (!res.ok) throw new Error('Failed to fetch items');
      const data: Item[] = await res.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    } finally {
      setItemsLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const generateForecast = async (itemId: string) => {
    if (!itemId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/forecasting?itemId=${itemId}&days=${daysAhead}`);
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to generate forecast'); }
      const data: ForecastData = await res.json();
      setForecasts(prev => prev.some(f => f.itemId === itemId) ? prev.map(f => f.itemId === itemId ? data : f) : [...prev, data]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate forecast');
    } finally {
      setLoading(false);
    }
  };

  const generateBatchForecast = async () => {
    if (items.length === 0) { setError('No items available. Please wait for items to load.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/forecasting/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds: items.slice(0, 5).map(i => i.id), daysAhead }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to generate batch forecast'); }
      const result = await res.json();
      setForecasts(result.forecasts);
      if (result.errors?.length) setError(`Partial errors: ${result.errors.join(', ')}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate batch forecast');
    } finally {
      setLoading(false);
    }
  };

  // Summary KPIs
  const avgAccuracy = forecasts.length ? forecasts.reduce((s, f) => s + f.accuracy, 0) / forecasts.length : 0;
  const increasing = forecasts.filter(f => f.trend === 'increasing').length;
  const decreasing = forecasts.filter(f => f.trend === 'decreasing').length;
  const totalForecastedUnits = forecasts.reduce((s, f) => s + f.forecast.slice(0, 7).reduce((a, b) => a + b.predictedQuantity, 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="h-8 w-8 text-indigo-500" />
            Demand Forecasting
          </h1>
          <p className="text-muted-foreground mt-1">AI-powered demand prediction for inventory management</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchItems} disabled={itemsLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${itemsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generate Forecasts</CardTitle>
          <CardDescription>Select items and forecast horizon to run AI demand predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="min-w-[220px]">
              <p className="text-sm font-medium mb-1.5">Item</p>
              <Select value={selectedItemId} onValueChange={setSelectedItemId} disabled={itemsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder={itemsLoading ? 'Loading items…' : 'Choose an item'} />
                </SelectTrigger>
                <SelectContent>
                  {items.map(item => (
                    <SelectItem key={item.id} value={item.id}>{item.name} <span className="text-muted-foreground">({item.sku})</span></SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[130px]">
              <p className="text-sm font-medium mb-1.5">Horizon</p>
              <Select value={daysAhead.toString()} onValueChange={v => setDaysAhead(parseInt(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[7, 14, 30, 60, 90].map(d => <SelectItem key={d} value={d.toString()}>{d} days</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => generateForecast(selectedItemId)} disabled={!selectedItemId || loading || itemsLoading}>
              <Zap className="h-4 w-4 mr-2" />
              {loading ? 'Generating…' : 'Generate Forecast'}
            </Button>
            <Button variant="outline" onClick={generateBatchForecast} disabled={loading || itemsLoading || items.length === 0}>
              <Layers className="h-4 w-4 mr-2" />
              Batch Forecast (Top {Math.min(5, items.length)})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      {forecasts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Items Forecasted" value={forecasts.length.toString()} sub="Active predictions" icon={BarChart3} color="bg-indigo-500" />
          <KpiCard title="Avg Model Accuracy" value={`${(avgAccuracy * 100).toFixed(1)}%`} sub="Across all models" icon={Target} color="bg-emerald-500" />
          <KpiCard title="7-Day Demand" value={totalForecastedUnits.toLocaleString()} sub="Total predicted units" icon={Activity} color="bg-amber-500" />
          <KpiCard
            title="Trend Summary"
            value={`${increasing}↑ ${decreasing}↓`}
            sub={`${forecasts.length - increasing - decreasing} stable`}
            icon={TrendingUp}
            color="bg-violet-500"
          />
        </div>
      )}

      {/* Main Content */}
      {loading && forecasts.length === 0 ? (
        <LoadingSkeleton />
      ) : forecasts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">No forecasts yet</p>
            <p className="text-sm text-muted-foreground mt-1">Select an item above or run a batch forecast to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="table">
          <TabsList>
            <TabsTrigger value="table">Results Table</TabsTrigger>
            <TabsTrigger value="comparison">Comparison Chart</TabsTrigger>
          </TabsList>

          {/* Table Tab */}
          <TabsContent value="table" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Forecast Results ({forecasts.length})</CardTitle>
                <CardDescription>Click Details to view charts and full prediction data</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>7-Day Avg</TableHead>
                      <TableHead>30-Day Avg</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forecasts.map(forecast => {
                      const cfg = TREND_CONFIG[forecast.trend] ?? TREND_CONFIG.stable;
                      const TrendIcon = cfg.icon;
                      const slice7 = forecast.forecast.slice(0, 7);
                      const slice30 = forecast.forecast.slice(0, 30);
                      const avg7 = slice7.length ? slice7.reduce((s, f) => s + f.predictedQuantity, 0) / slice7.length : 0;
                      const avg30 = slice30.length ? slice30.reduce((s, f) => s + f.predictedQuantity, 0) / slice30.length : 0;
                      const avgConf = slice7.length ? slice7.reduce((s, f) => s + f.confidence, 0) / slice7.length : 0;

                      return (
                        <TableRow key={forecast.itemId}>
                          <TableCell>
                            <div className="font-medium">{forecast.itemName}</div>
                            <div className="text-xs text-muted-foreground">{forecast.sku}</div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${cfg.badge} text-white gap-1`}>
                              <TrendIcon className="h-3 w-3" />
                              {cfg.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={forecast.accuracy * 100} className="w-16 h-1.5" />
                              <span className="text-sm font-medium">{(forecast.accuracy * 100).toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{avg7.toFixed(1)} <span className="text-xs text-muted-foreground">u/day</span></TableCell>
                          <TableCell className="font-medium">{avg30.toFixed(1)} <span className="text-xs text-muted-foreground">u/day</span></TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={avgConf * 100} className="w-16 h-1.5" />
                              <span className={`text-sm ${avgConf >= 0.8 ? 'text-emerald-600' : avgConf >= 0.6 ? 'text-amber-600' : 'text-red-600'}`}>
                                {(avgConf * 100).toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => setDetailForecast(forecast)}>
                              <BarChart3 className="h-3.5 w-3.5 mr-1" />
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">14-Day Demand Comparison</CardTitle>
                <CardDescription>Predicted daily demand across all forecasted items</CardDescription>
              </CardHeader>
              <CardContent>
                <ComparisonChart forecasts={forecasts} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailForecast} onOpenChange={open => !open && setDetailForecast(null)}>
        {detailForecast && (
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-500" />
                {detailForecast.itemName}
                <span className="text-sm font-normal text-muted-foreground">({detailForecast.sku})</span>
              </DialogTitle>
              <DialogDescription>AI demand forecast — {detailForecast.forecast.length}-day horizon</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Mini KPIs */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Model Accuracy', value: `${(detailForecast.accuracy * 100).toFixed(1)}%` },
                  { label: 'Trend', value: (TREND_CONFIG[detailForecast.trend] ?? TREND_CONFIG.stable).label },
                  { label: 'Days Forecasted', value: detailForecast.forecast.length.toString() },
                ].map(({ label, value }) => (
                  <Card key={label}>
                    <CardContent className="pt-4 pb-3">
                      <div className="text-xl font-bold">{value}</div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Demand Chart */}
              <div>
                <p className="text-sm font-medium mb-2">Historical vs Forecast</p>
                <ForecastChart forecast={detailForecast.forecast} historicalData={detailForecast.historicalData} />
              </div>

              {/* Confidence Chart */}
              <div>
                <p className="text-sm font-medium mb-2">Forecast Confidence (30 days)</p>
                <ConfidenceChart forecast={detailForecast.forecast} />
              </div>

              {/* Data Table */}
              <Tabs defaultValue="forecast">
                <TabsList className="h-8">
                  <TabsTrigger value="forecast" className="text-xs">Forecast Data</TabsTrigger>
                  <TabsTrigger value="historical" className="text-xs">Historical Data</TabsTrigger>
                </TabsList>
                <TabsContent value="forecast">
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Predicted Units</TableHead>
                          <TableHead className="text-xs">Confidence</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailForecast.forecast.map((p, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs py-1.5">{p.date}</TableCell>
                            <TableCell className="text-xs py-1.5 font-medium">{p.predictedQuantity}</TableCell>
                            <TableCell className="text-xs py-1.5">
                              <span className={p.confidence >= 0.8 ? 'text-emerald-600' : p.confidence >= 0.6 ? 'text-amber-600' : 'text-red-600'}>
                                {(p.confidence * 100).toFixed(0)}%
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                <TabsContent value="historical">
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Date</TableHead>
                          <TableHead className="text-xs">Actual Units</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detailForecast.historicalData.map((p, i) => (
                          <TableRow key={i}>
                            <TableCell className="text-xs py-1.5">{p.date}</TableCell>
                            <TableCell className="text-xs py-1.5 font-medium">{p.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
