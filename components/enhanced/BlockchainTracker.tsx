'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Shield, Link, CheckCircle, Clock, Hash, Database } from 'lucide-react';

interface BlockchainTransaction {
  id: string;
  hash: string;
  type: 'inventory' | 'shipment' | 'quality' | 'maintenance';
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  data: any;
}

export default function BlockchainTracker() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [networkStatus, setNetworkStatus] = useState({
    connected: true,
    blockHeight: 12847,
    peers: 8,
    hashRate: '2.4 TH/s'
  });

  useEffect(() => {
    // Simulate blockchain transactions
    const mockTransactions: BlockchainTransaction[] = [
      {
        id: '1',
        hash: '0x1a2b3c4d5e6f7890abcdef1234567890',
        type: 'inventory',
        timestamp: new Date().toISOString(),
        status: 'confirmed',
        confirmations: 12,
        data: { item: 'SKU-001', quantity: 100, location: 'A-01-01' }
      },
      {
        id: '2',
        hash: '0x9876543210fedcba0987654321abcdef',
        type: 'shipment',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        status: 'pending',
        confirmations: 3,
        data: { shipment: 'SH-2024-001', destination: 'Warehouse B' }
      },
      {
        id: '3',
        hash: '0xabcdef1234567890fedcba0987654321',
        type: 'quality',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        status: 'confirmed',
        confirmations: 25,
        data: { inspection: 'QI-001', result: 'PASSED', inspector: 'John Doe' }
      }
    ];
    
    setTransactions(mockTransactions);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setNetworkStatus(prev => ({
        ...prev,
        blockHeight: prev.blockHeight + Math.floor(Math.random() * 3),
        peers: 6 + Math.floor(Math.random() * 5)
      }));
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 border-green-500/30';
      case 'pending': return 'text-yellow-400 border-yellow-500/30';
      case 'failed': return 'text-red-400 border-red-500/30';
      default: return 'text-blue-400 border-blue-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inventory': return <Database className="h-4 w-4" />;
      case 'shipment': return <Link className="h-4 w-4" />;
      case 'quality': return <CheckCircle className="h-4 w-4" />;
      case 'maintenance': return <Shield className="h-4 w-4" />;
      default: return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <Card className="glass-effect hover-glow transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-glow flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-400" />
          Blockchain Ledger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Network Status */}
        <div className="glass-effect p-4 rounded-lg border border-electricBlue/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-foreground">Network Status</h4>
            <Badge variant="outline" className="text-green-400 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Block Height:</span>
              <div className="font-medium text-foreground">{networkStatus.blockHeight.toLocaleString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Peers:</span>
              <div className="font-medium text-foreground">{networkStatus.peers}</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Recent Transactions</h4>
          {transactions.map((tx) => (
            <div key={tx.id} className="glass-effect p-3 rounded-lg border border-electricBlue/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(tx.type)}
                  <span className="text-sm font-medium capitalize">{tx.type}</span>
                </div>
                <Badge variant="outline" className={`text-xs ${getStatusColor(tx.status)}`}>
                  {tx.status}
                </Badge>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="font-mono text-muted-foreground">{tx.hash.slice(0, 20)}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {tx.status === 'confirmed' && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Confirmations:</span>
                    <span className="text-green-400">{tx.confirmations}/12</span>
                  </div>
                )}
              </div>
              
              {tx.status === 'pending' && (
                <div className="mt-2">
                  <Progress value={(tx.confirmations / 12) * 100} className="h-1" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="glass-effect hover-glow">
            <Hash className="h-4 w-4 mr-2" />
            View Explorer
          </Button>
          <Button variant="outline" size="sm" className="glass-effect hover-glow">
            <Shield className="h-4 w-4 mr-2" />
            Verify Chain
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}