'use client';

import { useState, useEffect } from 'react';

export const runtime = 'edge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, Minus, BarChart3, AlertTriangle, Calendar } from 'lucide-react';

interface ForecastData {
  itemId: string;
  itemName: string;
  sku: string;
  historicalData: Array<{
    date: string;
    quantity: number;
  }>;
  forecast: Array<{
    date: string;
    predictedQuantity: number;
    confidence: number;
  }>;
  accuracy: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface Item {
  id: string;
  name: string;
  sku: string;
}

export default function ForecastingPage() {
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [daysAhead, setDaysAhead] = useState(30);
  const [selectedForecast, setSelectedForecast] = useState<ForecastData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) throw new Error('Failed to fetch items');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
    }
  };

  const generateForecast = async (itemId: string) => {
    if (!itemId) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/forecasting?itemId=${itemId}&days=${daysAhead}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate forecast');
      }

      const forecastData = await response.json();
      setForecasts(prev => {
        const existing = prev.find(f => f.itemId === itemId);
        if (existing) {
          return prev.map(f => f.itemId === itemId ? forecastData : f);
        } else {
          return [...prev, forecastData];
        }
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate forecast');
    } finally {
      setLoading(false);
    }
  };

  const generateBatchForecast = async () => {
    const selectedItems = items.slice(0, 5); // Limit to first 5 items for demo
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/forecasting/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemIds: selectedItems.map(item => item.id),
          daysAhead
        }),
      });

      if (!response.ok) throw new Error('Failed to generate batch forecast');

      const result = await response.json();
      setForecasts(result.forecasts);

      if (result.errors && result.errors.length > 0) {
        setError(`Some forecasts failed: ${result.errors.join(', ')}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate forecasts');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendBadge = (trend: string) => {
    const colors = {
      increasing: 'bg-green-500',
      decreasing: 'bg-red-500',
      stable: 'bg-gray-500',
    };

    return (
      <Badge className={`${colors[trend as keyof typeof colors]} text-white`}>
        {trend}
      </Badge>
    );
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Demand Forecasting</h1>
          <p className="text-muted-foreground">AI-powered demand prediction for inventory management</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Forecasts</CardTitle>
          <CardDescription>Use AI to predict future demand for items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="item">Select Item</Label>
              <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an item" />
                </SelectTrigger>
                <SelectContent>
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="days">Days Ahead</Label>
              <Select value={daysAhead.toString()} onValueChange={(value) => setDaysAhead(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button
                onClick={() => generateForecast(selectedItemId)}
                disabled={!selectedItemId || loading}
                className="flex-1"
              >
                {loading ? 'Generating...' : 'Generate Forecast'}
              </Button>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={generateBatchForecast}
                disabled={loading}
                className="w-full"
              >
                Batch Forecast (Top 5)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forecasts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Forecast Results ({forecasts.length})</CardTitle>
          <CardDescription>AI-generated demand predictions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>Next 7 Days</TableHead>
                <TableHead>Next 30 Days</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forecasts.map((forecast) => {
                const next7Days = forecast.forecast.slice(0, 7);
                const next30Days = forecast.forecast.slice(0, 30);
                const avg7Days = next7Days.reduce((sum, f) => sum + f.predictedQuantity, 0) / next7Days.length;
                const avg30Days = next30Days.reduce((sum, f) => sum + f.predictedQuantity, 0) / next30Days.length;

                return (
                  <TableRow key={forecast.itemId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{forecast.itemName}</div>
                        <div className="text-sm text-muted-foreground">{forecast.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(forecast.trend)}
                        {getTrendBadge(forecast.trend)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{(forecast.accuracy * 100).toFixed(1)}%</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{avg7Days.toFixed(1)} units/day</div>
                        <div className={`text-xs ${getConfidenceColor(next7Days[0]?.confidence || 0)}`}>
                          {(next7Days[0]?.confidence * 100 || 0).toFixed(0)}% confidence
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{avg30Days.toFixed(1)} units/day</div>
                        <div className={`text-xs ${getConfidenceColor(next30Days[0]?.confidence || 0)}`}>
                          Avg {(next30Days.reduce((sum, f) => sum + f.confidence, 0) / next30Days.length * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && selectedForecast?.itemId === forecast.itemId} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedForecast(forecast)}
                          >
                            <BarChart3 className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Calendar className="h-5 w-5" />
                              Forecast Details: {forecast.itemName}
                            </DialogTitle>
                            <DialogDescription>
                              Detailed demand forecast and historical data
                            </DialogDescription>
                          </DialogHeader>
                          {selectedForecast && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-3 gap-4">
                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="text-2xl font-bold">{selectedForecast.accuracy.toFixed(2)}</div>
                                    <p className="text-xs text-muted-foreground">Model Accuracy</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="text-2xl font-bold flex items-center gap-1">
                                      {getTrendIcon(selectedForecast.trend)}
                                      {selectedForecast.trend}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Trend</p>
                                  </CardContent>
                                </Card>
                                <Card>
                                  <CardContent className="pt-4">
                                    <div className="text-2xl font-bold">{selectedForecast.forecast.length}</div>
                                    <p className="text-xs text-muted-foreground">Days Forecasted</p>
                                  </CardContent>
                                </Card>
                              </div>

                              <div>
                                <Label>Forecast Data</Label>
                                <div className="mt-2 max-h-60 overflow-y-auto border rounded p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">Historical Data (Last 30 days)</h4>
                                      <div className="space-y-1 text-sm">
                                        {selectedForecast.historicalData.slice(-10).map((data, index) => (
                                          <div key={index} className="flex justify-between">
                                            <span>{data.date}</span>
                                            <span>{data.quantity} units</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">Predicted Demand</h4>
                                      <div className="space-y-1 text-sm">
                                        {selectedForecast.forecast.slice(0, 10).map((pred, index) => (
                                          <div key={index} className="flex justify-between">
                                            <span>{pred.date}</span>
                                            <span className={getConfidenceColor(pred.confidence)}>
                                              {pred.predictedQuantity} units ({(pred.confidence * 100).toFixed(0)}%)
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {forecasts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No forecasts generated yet. Select an item and click &quot;Generate Forecast&quot; to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
