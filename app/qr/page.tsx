'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, StatusBadge } from '@/components/shared';
import { 
  QrCode, Scan, MapPin, Clock, RefreshCw, Plus, 
  Activity, CheckCircle, Download, Eye
} from 'lucide-react';

export default function QRPage() {
  const [qrCodes, setQrCodes] = React.useState([
    {
      id: '1',
      qrCode: 'QR-001-XYZ789',
      itemId: 'ITEM-001',
      itemName: 'Electronic Component A',
      location: 'A-01-01',
      status: 'ACTIVE',
      createdAt: new Date(),
      scannedCount: 15
    }
  ]);

  const [scanInput, setScanInput] = React.useState('');
  const [isScanning, setIsScanning] = React.useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (scanInput) {
        const existingCode = qrCodes.find(qr => qr.qrCode === scanInput);
        if (existingCode) {
          setQrCodes(prev => prev.map(qr => 
            qr.qrCode === scanInput 
              ? { ...qr, scannedCount: qr.scannedCount + 1 }
              : qr
          ));
        } else {
          const newCode = {
            id: Date.now().toString(),
            qrCode: scanInput,
            itemId: `ITEM-${Date.now()}`,
            itemName: 'New Scanned Item',
            location: 'UNKNOWN',
            status: 'ACTIVE',
            createdAt: new Date(),
            scannedCount: 1
          };
          setQrCodes(prev => [newCode, ...prev]);
        }
        setScanInput('');
      }
    }, 1500);
  };

  const generateQR = () => {
    const newCode = {
      id: Date.now().toString(),
      qrCode: `QR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      itemId: `ITEM-${Date.now()}`,
      itemName: 'Generated Item',
      location: 'PENDING',
      status: 'ACTIVE',
      createdAt: new Date(),
      scannedCount: 0
    };
    setQrCodes(prev => [newCode, ...prev]);
  };

  const columns = [
    {
      key: 'qrCode' as const,
      header: 'QR Code',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-blue-500" />
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
      key: 'scannedCount' as const,
      header: 'Scans',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <Scan className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'createdAt' as const,
      header: 'Created',
      render: (value: Date) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-sm">{new Date(value).toLocaleDateString()}</span>
        </div>
      )
    }
  ];

  const stats = {
    total: qrCodes.length,
    active: qrCodes.filter(qr => qr.status === 'ACTIVE').length,
    totalScans: qrCodes.reduce((sum, qr) => sum + qr.scannedCount, 0),
    recent: qrCodes.filter(qr => 
      new Date().getTime() - new Date(qr.createdAt).getTime() < 24 * 60 * 60 * 1000
    ).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">QR Code Management</h1>
          <p className="text-muted-foreground">Generate and track QR codes for inventory items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={generateQR}>
            <Plus className="h-4 w-4 mr-2" />
            Generate QR
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <QrCode className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total QR Codes</p>
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
              <Scan className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.totalScans}</p>
                <p className="text-sm text-muted-foreground">Total Scans</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{stats.recent}</p>
                <p className="text-sm text-muted-foreground">Recent (24h)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              QR Scanner
            </CardTitle>
            <CardDescription>Scan QR codes to track items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Enter QR code or scan..."
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
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Generator
            </CardTitle>
            <CardDescription>Generate new QR codes for items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={generateQR} className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Generate New QR Code
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>QR Codes</CardTitle>
          <CardDescription>{qrCodes.length} codes generated</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={qrCodes}
            columns={columns}
            loading={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}