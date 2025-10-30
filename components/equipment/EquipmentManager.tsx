'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function EquipmentManager() {
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/equipment')
      .then(res => res.json())
      .then(data => {
        setEquipment(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Robots ({equipment?.robots?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {equipment?.robots?.map((robot: any) => (
              <Card key={robot.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{robot.code}</span>
                      <Badge variant={robot.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {robot.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{robot.name}</p>
                    <p className="text-xs">Type: {robot.type}</p>
                    <p className="text-xs">Zone: {robot.zone?.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sensors ({equipment?.sensors?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {equipment?.sensors?.map((sensor: any) => (
              <Card key={sensor.id}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{sensor.code}</span>
                      <Badge variant={sensor.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {sensor.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{sensor.name}</p>
                    <p className="text-xs">Type: {sensor.type}</p>
                    <p className="text-xs">Zone: {sensor.zone?.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
