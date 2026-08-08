import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface HalalProduct {
  id: string;
  sku: string;
  name: string;
  arabicName?: string;
  category: string;
  halalStatus: string;
  manufacturer: { name: string };
  supplier: { name: string };
  certificationBody?: { name: string };
  inventoryItems: any[];
  batches: any[];
}

interface HalalInventory {
  id: string;
  productId: string;
  location: string;
  zone: string;
  quantity: number;
  certificationStatus: string;
  segregationCompliant: boolean;
  quarantineStatus: boolean;
  product: HalalProduct;
}

export function useHalalProducts() {
  const [filters, setFilters] = useState({
    category: 'ALL',
    status: 'ALL',
    search: ''
  });

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ['halal-products', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category !== 'ALL') params.set('category', filters.category);
      if (filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.search) params.set('search', filters.search);

      const queryParams = Object.fromEntries(params);
      return (apiClient as any).halal.getProducts(queryParams) as Promise<any[]>;
    }
  });

  return {
    products,
    isLoading,
    error,
    filters,
    setFilters,
    refetch
  };
}

export function useHalalInventory() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['halal-inventory'],
    queryFn: async () => {
      return (apiClient as any).halal.getInventory() as Promise<any>;
    }
  });

  return {
    inventory: (data as any)?.inventory || [],
    stats: (data as any)?.stats || {},
    isLoading,
    error,
    refetch
  };
}
