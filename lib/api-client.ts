import { Shipment, Transaction } from '@/lib/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Generic CRUD operations
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<T>(`${endpoint}${searchParams}`);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Specific API methods
  analytics = {
    get: (period?: string) => this.get('/api/analytics', period ? { period } : undefined),
  };

  inventory = {
    getAll: () => this.get('/api/inventory'),
    getById: (id: string) => this.get(`/api/inventory/${id}`),
    create: (data: any) => this.post('/api/inventory', data),
    update: (id: string, data: any) => this.put(`/api/inventory/${id}`, data),
    delete: (id: string) => this.delete(`/api/inventory/${id}`),
    getStockLevels: () => this.get('/api/inventory/stock-levels'),
    updateQuantity: (id: string, quantity: number) => this.put(`/api/inventory/${id}/quantity`, { quantity }),
  };

  items = {
    getAll: () => this.get('/api/items'),
    getById: (id: string) => this.get(`/api/items/${id}`),
    create: (data: any) => this.post('/api/items', data),
    update: (id: string, data: any) => this.put(`/api/items/${id}`, data),
    delete: (id: string) => this.delete(`/api/items/${id}`),
  };

  robots = {
    getAll: () => this.get('/api/robots'),
    getById: (id: string) => this.get(`/api/robots/${id}`),
    create: (data: any) => this.post('/api/robots', data),
    update: (id: string, data: any) => this.put(`/api/robots/${id}`, data),
    delete: (id: string) => this.delete(`/api/robots/${id}`),
  };

  halal = {
    getProducts: (params?: any) => this.get('/api/halal/products', params),
    getInventory: () => this.get('/api/halal/inventory'),
  };

  alerts = {
    getAll: () => this.get('/api/alerts'),
    getById: (id: string) => this.get(`/api/alerts/${id}`),
    create: (data: any) => this.post('/api/alerts', data),
    acknowledge: (id: string) => this.put(`/api/alerts/${id}/acknowledge`, {}),
    resolve: (id: string) => this.put(`/api/alerts/${id}/resolve`, {}),
  };

  sensors = {
    getAll: () => this.get('/api/sensors'),
    getById: (id: string) => this.get(`/api/sensors/${id}`),
    getReadings: (sensorId?: string) => this.get('/api/sensors/readings', sensorId ? { sensorId } : undefined),
  };

  shipments = {
    getAll: () => this.get<Shipment[]>('/api/shipments'),
    getById: (id: string) => this.get<Shipment>(`/api/shipments/${id}`),
    create: (data: any) => this.post<Shipment>('/api/shipments', data),
    update: (id: string, data: any) => this.put<Shipment>(`/api/shipments/${id}`, data),
    delete: (id: string) => this.delete<void>(`/api/shipments/${id}`),
    track: (trackingNumber: string) => this.get<Shipment>(`/api/shipments/track/${trackingNumber}`),
  };

  logistics = {
    fleet: {
      getAll: () => this.get('/api/logistics/fleet'),
      getById: (id: string) => this.get(`/api/logistics/fleet/${id}`),
      create: (data: any) => this.post('/api/logistics/fleet', data),
      update: (id: string, data: any) => this.put(`/api/logistics/fleet/${id}`, data),
    },
    routing: {
      optimize: (data: any) => this.post('/api/logistics/routing', data),
      getRoutes: () => this.get('/api/logistics/routing'),
    },
    tracking: {
      getAll: () => this.get('/api/logistics/tracking'),
      track: (trackingNumber: string) => this.get(`/api/logistics/tracking/${trackingNumber}`),
    },
  };

  supplyChain = {
    getAll: () => this.get('/api/supply-chain'),
    getById: (id: string) => this.get(`/api/supply-chain/${id}`),
    create: (data: any) => this.post('/api/supply-chain', data),
    update: (id: string, data: any) => this.put(`/api/supply-chain/${id}`, data),
    delete: (id: string) => this.delete(`/api/supply-chain/${id}`),
    getMetrics: () => this.get('/api/supply-chain/metrics'),
  };

  robotCommands = {
    getAll: (params?: any) => this.get('/api/robot-commands', params),
    create: (data: any) => this.post('/api/robot-commands', data),
    update: (id: string, data: any) => this.put(`/api/robot-commands/${id}`, data),
    cancel: (id: string) => this.delete(`/api/robot-commands/${id}`),
  };

  robotMetrics = {
    getAll: () => this.get('/api/robot-metrics'),
    getById: (id: string) => this.get(`/api/robot-metrics/${id}`),
  };

  iot = {
    getDevices: (query?: any) => this.get('/api/iot/devices', query),
    getSensors: () => this.get('/api/iot/sensors'),
    getReadings: (query?: any) => this.get('/api/iot/readings', query),
    createDevice: (data: any) => this.post('/api/iot/devices', data),
    updateDevice: (id: string, data: any) => this.put(`/api/iot/devices/${id}`, data),
    sendCommand: (data: any) => this.post('/api/iot/commands', data),
  };

  aiAgents = {
    getAgents: () => this.get('/api/ai-agents'),
    getOrchestrator: () => this.get('/api/ai-agents/orchestrator'),
    getTasks: (query?: any) => this.get('/api/ai-agents/tasks', query),
    createTask: (data: any) => this.post('/api/ai-agents/tasks', data),
    getPredictions: (query?: any) => this.get('/api/ai-agents/predictions', query),
    optimize: (data: any) => this.post('/api/ai-agents/optimize', data),
    getAgentStatus: (id: string) => this.get(`/api/ai-agents/agents/${id}/status`),
  };

  barcode = {
    generate: (data: any) => this.post('/api/barcode/generate', data),
    scan: (data: any) => this.post('/api/barcode/scan', data),
    validate: (data: any) => this.post('/api/barcode/validate', data),
    getHistory: (query?: any) => this.get('/api/barcode/history', query),
    getStats: () => this.get('/api/barcode/stats'),
    getInfo: (code: string) => this.get(`/api/barcode/${code}`),
  };

  rfid = {
    getTags: (query?: any) => this.get('/api/rfid/tags', query),
    getReaders: () => this.get('/api/rfid/readers'),
    scan: (data: any) => this.post('/api/rfid/scan', data),
    write: (data: any) => this.post('/api/rfid/write', data),
    track: (tagId: string) => this.get(`/api/rfid/tracking/${tagId}`),
    getStats: () => this.get('/api/rfid/stats'),
    bulkScan: (data: any) => this.post('/api/rfid/bulk-scan', data),
  };

  qrCode = {
    generate: (data: any) => this.post('/api/qr-code/generate', data),
    scan: (data: any) => this.post('/api/qr-code/scan', data),
    validate: (data: any) => this.post('/api/qr-code/validate', data),
    getHistory: (query?: any) => this.get('/api/qr-code/history', query),
    getStats: () => this.get('/api/qr-code/stats'),
    getInfo: (code: string) => this.get(`/api/qr-code/${code}`),
    batchGenerate: (data: any) => this.post('/api/qr-code/batch-generate', data),
  };

  transactions = {
    getAll: () => this.get<Transaction[]>('/api/transactions'),
    getById: (id: string) => this.get<Transaction>(`/api/transactions/${id}`),
    create: (data: any) => this.post<Transaction>('/api/transactions', data),
    update: (id: string, data: any) => this.put<Transaction>(`/api/transactions/${id}`, data),
    delete: (id: string) => this.delete<void>(`/api/transactions/${id}`),
  };
}

export const apiClient = new ApiClient();
export default apiClient;