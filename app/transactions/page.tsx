'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable, FilterPanel, StatusBadge } from '@/components/shared';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useWebSocket } from '@/lib/websocket';
import {
  ArrowUpDown, Search, Filter, Plus, Download, Eye, RefreshCw,
  AlertTriangle, BarChart3, Activity, TrendingUp
} from 'lucide-react';

export default function TransactionsPage() {
  const router = useRouter();
  const {
    transactions,
    filteredTransactions,
    transactionStats,
    isLoading,
    error,
    filters,
    setFilters,
    clearFilters,
    createTransaction,
    refreshTransactions
  } = useTransactions();
  
  const { isConnected } = useWebSocket();

  const navigateToDetail = (transactionId: string) => {
    router.push(`/transactions/${transactionId}`);
  };

  const navigateToAnalytics = () => {
    router.push('/analytics');
  };

  const navigateToMovements = () => {
    router.push('/movements');
  };

  const filterOptions = [
    {
      key: 'type',
      label: 'Transaction Type',
      type: 'select' as const,
      options: [
        { value: 'PUTAWAY', label: 'Putaway' },
        { value: 'PICKING', label: 'Picking' },
        { value: 'TRANSFER', label: 'Transfer' },
        { value: 'ADJUSTMENT', label: 'Adjustment' },
        { value: 'COUNT', label: 'Count' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'PENDING', label: 'Pending' },
        { value: 'FAILED', label: 'Failed' }
      ]
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text' as const,
      placeholder: 'Search transactions, locations, notes'
    }
  ];

  const columns = [
    {
      key: 'id' as const,
      header: 'Transaction ID',
      render: (value: string) => (
        <span className="font-medium">{value}</span>
      )
    },
    {
      key: 'type' as const,
      header: 'Type',
      render: (value: string) => (
        <StatusBadge status={value.toLowerCase() as any} />
      )
    },
    {
      key: 'status' as const,
      header: 'Status',
      render: (value: string) => (
        <StatusBadge status={value.toLowerCase() as any} />
      )
    },
    {
      key: 'quantity' as const,
      header: 'Quantity'
    },
    {
      key: 'sourceLocation' as const,
      header: 'Source',
      render: (value: string) => value || '-'
    },
    {
      key: 'destinationLocation' as const,
      header: 'Destination',
      render: (value: string) => value || '-'
    },
    {
      key: 'timestamp' as const,
      header: 'Timestamp',
      render: (value: Date) => new Date(value).toLocaleString()
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-muted-foreground">
            Track all warehouse transactions and movements
            {isConnected && <span className="ml-2 text-green-600">• Live</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refreshTransactions()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={navigateToAnalytics} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={navigateToMovements} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Movements
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{transactionStats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{transactionStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Search className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{transactionStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold">{transactionStats.failed}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel
            filters={filterOptions}
            values={filters}
            onChange={(key: string, value: any) => setFilters({ [key]: value })}
            onClear={clearFilters}
          />
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredTransactions.length} of {transactions.length} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredTransactions}
                columns={columns}
                loading={isLoading}
                onRowClick={(transaction) => navigateToDetail(transaction.id)}
                searchable={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}