'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SettingsManager() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Settings</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Version</Label>
              <p className="text-2xl font-bold">{settings?.version}</p>
            </div>
            <div>
              <Label>Status</Label>
              <p className="text-2xl font-bold capitalize">{settings?.systemStatus}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Warehouses</Label>
              <p className="text-2xl font-bold">{settings?.warehouses}</p>
            </div>
            <div>
              <Label>Zones</Label>
              <p className="text-2xl font-bold">{settings?.zones}</p>
            </div>
            <div>
              <Label>Users</Label>
              <p className="text-2xl font-bold">{settings?.users}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>System Name</Label>
              <Input placeholder="ASRS System" />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input placeholder="UTC" />
            </div>
            <Button>Save Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
