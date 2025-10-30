'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RobotControl() {
  const [robots, setRobots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/robots')
      .then(res => res.json())
      .then(data => {
        setRobots(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Robot Control</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {robots.map((robot: any) => (
          <Card key={robot.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{robot.code}</CardTitle>
                <Badge variant={robot.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {robot.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Name:</span> {robot.name}</p>
                <p><span className="font-semibold">Type:</span> {robot.type}</p>
                <p><span className="font-semibold">Zone:</span> {robot.zone?.name}</p>
                <p><span className="font-semibold">Location:</span> {robot.location || 'N/A'}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Move</Button>
                <Button size="sm" variant="outline">Stop</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
