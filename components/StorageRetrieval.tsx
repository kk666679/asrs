'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, ArrowDown, ArrowUp, Loader2 } from 'lucide-react';

export default function StorageRetrieval() {
  const [mode, setMode] = useState<'putaway' | 'picking'>('putaway');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handlePutaway = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/putaway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: formData.get('itemId'),
          quantity: parseInt(formData.get('quantity') as string),
          priority: formData.get('priority'),
          batchNumber: formData.get('batchNumber') || undefined
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePicking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await fetch('/api/picking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{
            itemId: formData.get('itemId'),
            quantity: parseInt(formData.get('quantity') as string),
            priority: formData.get('priority')
          }]
        })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Operation failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Button
          variant={mode === 'putaway' ? 'default' : 'outline'}
          onClick={() => { setMode('putaway'); setResult(null); }}
        >
          <ArrowDown className="mr-2 h-4 w-4" />
          Putaway
        </Button>
        <Button
          variant={mode === 'picking' ? 'default' : 'outline'}
          onClick={() => { setMode('picking'); setResult(null); }}
        >
          <ArrowUp className="mr-2 h-4 w-4" />
          Picking
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {mode === 'putaway' ? 'Storage Putaway' : 'Order Picking'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'putaway' ? handlePutaway : handlePicking} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Item ID</label>
              <Input name="itemId" required placeholder="Enter item ID" />
            </div>
            <div>
              <label className="text-sm font-medium">Quantity</label>
              <Input name="quantity" type="number" required min="1" placeholder="Enter quantity" />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select name="priority" defaultValue="MEDIUM">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {mode === 'putaway' && (
              <div>
                <label className="text-sm font-medium">Batch Number (Optional)</label>
                <Input name="batchNumber" placeholder="Enter batch number" />
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'putaway' ? 'Find Storage Location' : 'Generate Picking Route'}
            </Button>
          </form>

          {result && (
            <div className="mt-6 p-4 bg-muted rounded-lg">
              {result.error ? (
                <p className="text-destructive">{result.error}</p>
              ) : mode === 'putaway' ? (
                <div>
                  <h3 className="font-semibold mb-2">Recommended Location</h3>
                  <p className="text-lg font-mono">{result.recommendation?.location}</p>
                  <p className="text-sm text-muted-foreground">Score: {result.recommendation?.score}</p>
                  <ul className="mt-2 text-sm">
                    {result.recommendation?.reasons.map((r: string, i: number) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div>
                  <h3 className="font-semibold mb-2">Picking Plan</h3>
                  <p className="text-sm">Routes: {result.plan?.routes.length}</p>
                  <p className="text-sm">Distance: {result.plan?.totalDistance.toFixed(2)}m</p>
                  <p className="text-sm">Time: {result.plan?.estimatedTime.toFixed(1)}min</p>
                  <p className="text-sm">Efficiency: {result.plan?.efficiency.toFixed(1)}%</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
