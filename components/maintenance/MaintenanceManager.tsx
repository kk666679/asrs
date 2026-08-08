'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MaintenanceManager() {
  const [maintenance, setMaintenance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/maintenance')
      .then(res => res.json())
      .then(data => {
        setMaintenance(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Bins</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{maintenance?.bins?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Robots</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{maintenance?.robots?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Sensors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{maintenance?.sensors?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {maintenance?.bins?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bins Under Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {maintenance.bins.map((bin: any) => (
                <div key={bin.id} className="flex justify-between items-center p-2 border rounded">
                  <span>{bin.code}</span>
                  <Badge variant="secondary">MAINTENANCE</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
