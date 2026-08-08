'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SensorMonitor() {
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sensors')
      .then(res => res.json())
      .then(data => {
        setSensors(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sensor Monitor</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sensors.map((sensor: any) => (
          <Card key={sensor.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{sensor.code}</CardTitle>
                <Badge variant={sensor.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {sensor.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm"><span className="font-semibold">Name:</span> {sensor.name}</p>
              <p className="text-sm"><span className="font-semibold">Type:</span> {sensor.type}</p>
              <p className="text-sm"><span className="font-semibold">Zone:</span> {sensor.zone?.name}</p>
              {sensor.readings?.[0] && (
                <div className="mt-4 p-3 bg-muted rounded">
                  <p className="text-sm font-semibold">Latest Reading</p>
                  <p className="text-2xl font-bold">{sensor.readings[0].value}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sensor.readings[0].timestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
