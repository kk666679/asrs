'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import LineChart from '@/components/charts/LineChart';

export default function ForecastingDashboard() {
  const [itemId, setItemId] = useState('');
  const [days, setDays] = useState('30');
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateForecast = async () => {
    if (!itemId) return;
    setLoading(true);
    const res = await fetch(`/api/forecasting?itemId=${itemId}&days=${days}`);
    const data = await res.json();
    setForecast(data);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demand Forecasting</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Item ID</Label>
            <Input value={itemId} onChange={(e) => setItemId(e.target.value)} placeholder="Enter item ID" />
          </div>
          <div className="space-y-2">
            <Label>Forecast Days</Label>
            <Input type="number" value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
          <Button onClick={generateForecast} disabled={loading || !itemId}>
            {loading ? 'Generating...' : 'Generate Forecast'}
          </Button>
        </CardContent>
      </Card>

      {forecast && (
        <Card>
          <CardHeader>
            <CardTitle>Forecast Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <p className="text-2xl font-bold">{forecast.trend}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold">{forecast.confidence}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Demand</p>
                  <p className="text-2xl font-bold">{forecast.averageDemand?.toFixed(2)}</p>
                </div>
              </div>
              {forecast.predictions && (
                <LineChart
                  data={forecast.predictions.map((p: any, i: number) => ({ name: `Day ${i+1}`, value: p }))}
                  lines={[{ dataKey: 'value', stroke: '#8884d8', name: 'Predicted Demand' }]}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
