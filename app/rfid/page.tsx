'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, StatusBadge } from '@/components/shared';
import { 
  Radio, Scan, MapPin, Clock, RefreshCw, Plus, 
  Activity, CheckCircle, AlertTriangle 
} from 'lucide-react';

export default function RFIDPage() {
  const [rfidTags, setRfidTags] = React.useState([
    {
      id: '1',
      tagId: 'RFID-001-ABC123',
      itemId: 'ITEM-001',
      itemName: 'Electronic Component A',
      location: 'A-01-01',
      status: 'ACTIVE',
      lastScan: new Date(),
      batteryLevel: 85
    }
  ]);

  const [scanInput, setScanInput] = React.useState('');
  const [isScanning, setIsScanning] = React.useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (scanInput) {
        const newTag = {
          id: Date.now().toString(),
          tagId: scanInput,
          itemId: `ITEM-${Date.now()}`,
          itemName: 'New Scanned Item',
          location: 'UNKNOWN',
          status: 'ACTIVE',
          lastScan: new Date(),
          batteryLevel: 100
        };
        setRfidTags(prev => [newTag, ...prev]);
        setScanInput('');
      }
    }, 2000);
  };

  const columns = [
    {
      key: 'tagId' as const,
      header: 'RFID Tag',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-blue-500" />
          <span className="font-mono text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'itemName' as const,
      header: 'Item'
    },
    {
      key: 'location' as const,
      header: 'Location',
      render: (value: string) => (
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => <StatusBadge status={value.toLowerCase() as any} />
    },
    {
      key: 'batteryLevel' as const,
      header: 'Battery',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${value > 50 ? 'bg-green-500' : value > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-sm">{value}%</span>
        </div>
      )
    }
  ];

  const stats = {
    total: rfidTags.length,
    active: rfidTags.filter(tag => tag.status === 'ACTIVE').length,
    inactive: rfidTags.filter(tag => tag.status === 'INACTIVE').length,
    lowBattery: rfidTags.filter(tag => tag.batteryLevel < 20).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RFID Management</h1>
          <p className="text-muted-foreground">Track and manage RFID tags for inventory items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Tag
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Radio className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Tags</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-gray-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.lowBattery}</p>
                <p className="text-sm text-muted-foreground">Low Battery</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            RFID Scanner
          </CardTitle>
          <CardDescription>Scan RFID tags to track items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Enter RFID tag ID or scan..."
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Scanning...
                </>
              ) : (
                <>
                  <Scan className="h-4 w-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RFID Tags</CardTitle>
          <CardDescription>{rfidTags.length} tags registered</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={rfidTags}
            columns={columns}
            loading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}