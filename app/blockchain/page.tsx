'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield, Lock, CheckCircle, Clock, AlertTriangle,
  FileText, Database, Network, Zap, Award, Brain, Globe
} from 'lucide-react';

import { useInView } from 'react-intersection-observer';
import BlockchainTracker from '@/components/enhanced/BlockchainTracker';
import IPFSStorage from '@/components/enhanced/IPFSStorage';
import TrustIndicator from '@/components/enhanced/TrustIndicator';

interface BlockchainTransaction {
  id: string;
  hash: string;
  type: 'halal_certification' | 'document_upload' | 'compliance_audit' | 'supply_chain_update';
  status: 'confirmed' | 'pending' | 'failed';
  timestamp: string;
  blockNumber: number;
  gasUsed: number;
  entityId: string;
  entityType: 'item' | 'product' | 'supplier' | 'document';
  halalCertified: boolean;
  certifyingBody?: string;
  ipfsHash?: string;
}

interface SmartContract {
  address: string;
  name: string;
  version: string;
  functions: string[];
  lastInteraction: string;
}

export default function BlockchainPage() {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [networkStats, setNetworkStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const fetchBlockchainData = async () => {
    try {
      // Fetch transactions
      const txResponse = await fetch('/api/blockchain/transactions');
      const txData = await txResponse.json();
      setTransactions(txData);

      // Fetch smart contracts
      const contractResponse = await fetch('/api/blockchain/contracts');
      const contractData = await contractResponse.json();
      setContracts(contractData);

      // Fetch network stats
      const statsResponse = await fetch('/api/blockchain/stats');
      const statsData = await statsResponse.json();
      setNetworkStats(statsData);
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'halal_certification':
        return <Award className="h-4 w-4 text-green-500" />;
      case 'document_upload':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'compliance_audit':
        return <Shield className="h-4 w-4 text-purple-500" />;
      case 'supply_chain_update':
        return <Network className="h-4 w-4 text-orange-500" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Network className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading Blockchain Ledger...</p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold gradient-text">HyperLedger Blockchain</h1>
          <p className="text-muted-foreground mt-1">Enterprise-grade blockchain for supply chain transparency</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Shield className="h-4 w-4 mr-2" />
            Audit Trail
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            New Transaction
          </Button>
        </div>
      </div>

      {/* Enhanced Components Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TrustIndicator />
        <BlockchainTracker />
        <IPFSStorage />
      </div>
      
      {/* AI-Powered Analytics */}
      <div ref={ref} className={`transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-glow flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-400" />
              AI-Powered Blockchain Analytics
            </CardTitle>
            <CardDescription>Machine learning insights from blockchain data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-medium">Fraud Detection</span>
                </div>
                <div className="text-2xl font-bold gradient-text">99.9%</div>
                <p className="text-xs text-muted-foreground">Accuracy rate</p>
              </div>
              
              <div className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">Network Health</span>
                </div>
                <div className="text-2xl font-bold gradient-text">98.5%</div>
                <p className="text-xs text-muted-foreground">Consensus efficiency</p>
              </div>
              
              <div className="glass-effect p-4 rounded-lg border border-electricBlue/20">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium">Compliance Score</span>
                </div>
                <div className="text-2xl font-bold gradient-text">100%</div>
                <p className="text-xs text-muted-foreground">Halal certified</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-effect hover-glow transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold gradient-text">{networkStats.totalTransactions || 12847}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{networkStats.certifiedEntities || 0}</p>
                <p className="text-sm text-muted-foreground">Halal Certified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Network className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{networkStats.activeNodes || 0}</p>
                <p className="text-sm text-muted-foreground">Network Nodes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Lock className="h-8 w-8 text-orange-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{networkStats.currentBlock || 0}</p>
                <p className="text-sm text-muted-foreground">Current Block</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="network">Network Status</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Transactions</CardTitle>
              <CardDescription>Immutable record of all HalalChain activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Halal Certified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <span className="capitalize">{tx.type.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {tx.hash.substring(0, 16)}...
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{tx.entityType}</p>
                          <p className="text-xs text-muted-foreground">{tx.entityId}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>#{tx.blockNumber}</TableCell>
                      <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        {tx.halalCertified ? (
                          <Badge className="bg-green-100 text-green-800">
                            ✓ {tx.certifyingBody || 'Certified'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Not Certified</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts">
          <Card>
            <CardHeader>
              <CardTitle>Smart Contracts</CardTitle>
              <CardDescription>HyperLedger smart contracts managing HalalChain logic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contracts.map((contract) => (
                  <Card key={contract.address}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{contract.name}</h3>
                          <p className="text-sm text-muted-foreground">v{contract.version}</p>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-2 block">
                            {contract.address}
                          </code>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Last interaction</p>
                          <p className="text-sm">{new Date(contract.lastInteraction).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Functions:</p>
                        <div className="flex flex-wrap gap-1">
                          {contract.functions.map((func) => (
                            <Badge key={func} variant="outline" className="text-xs">
                              {func}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="network">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Health</CardTitle>
                <CardDescription>Real-time blockchain network status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Block Height</span>
                  <span className="font-medium">{networkStats.currentBlock || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Peers</span>
                  <span className="font-medium">{networkStats.activePeers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Latency</span>
                  <span className="font-medium">{networkStats.latency || 0}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Consensus Status</span>
                  <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>HalalChain Features</CardTitle>
                <CardDescription>Unique capabilities of our platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Halal Certification Tracking</p>
                    <p className="text-sm text-muted-foreground">Immutable certification records</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Network className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Supply Chain Transparency</p>
                    <p className="text-sm text-muted-foreground">End-to-end traceability</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">IPFS Integration</p>
                    <p className="text-sm text-muted-foreground">Decentralized document storage</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">SEA Region Focus</p>
                    <p className="text-sm text-muted-foreground">Specialized for Southeast Asia</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>HalalChain - The Only ASRS Platform in SEA for Halal Products:</strong> Our HyperLedger-based
          blockchain ensures complete transparency and immutability for halal certification and supply chain
          management. Combined with IPFS for document storage, we provide the most secure and compliant
          solution for halal product warehousing in Southeast Asia.
        </AlertDescription>
      </Alert>
    </div>
  );
}
