'use client';

export interface MicroserviceConfig {
  name: string;
  endpoint: string;
  version: string;
  healthCheck: string;
  timeout: number;
  retries: number;
}

export const LOGISTICS_MICROSERVICES: Record<string, MicroserviceConfig> = {
  SHIPMENT_SERVICE: {
    name: 'Shipment Management Service',
    endpoint: process.env.NEXT_PUBLIC_SHIPMENT_SERVICE_URL || 'http://localhost:3001',
    version: 'v1',
    healthCheck: '/health',
    timeout: 5000,
    retries: 3
  },
  ROUTING_SERVICE: {
    name: 'Route Optimization Service',
    endpoint: process.env.NEXT_PUBLIC_ROUTING_SERVICE_URL || 'http://localhost:3002',
    version: 'v1',
    healthCheck: '/health',
    timeout: 10000,
    retries: 2
  },
  TRACKING_SERVICE: {
    name: 'Real-time Tracking Service',
    endpoint: process.env.NEXT_PUBLIC_TRACKING_SERVICE_URL || 'http://localhost:3003',
    version: 'v1',
    healthCheck: '/health',
    timeout: 3000,
    retries: 5
  },
  FLEET_SERVICE: {
    name: 'Fleet Management Service',
    endpoint: process.env.NEXT_PUBLIC_FLEET_SERVICE_URL || 'http://localhost:3004',
    version: 'v1',
    healthCheck: '/health',
    timeout: 5000,
    retries: 3
  },
  NOTIFICATION_SERVICE: {
    name: 'Notification Service',
    endpoint: process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost:3005',
    version: 'v1',
    healthCheck: '/health',
    timeout: 3000,
    retries: 2
  }
};

export class MicroserviceHealthChecker {
  private static instance: MicroserviceHealthChecker;
  private healthStatus: Map<string, 'healthy' | 'degraded' | 'down'> = new Map();

  static getInstance(): MicroserviceHealthChecker {
    if (!MicroserviceHealthChecker.instance) {
      MicroserviceHealthChecker.instance = new MicroserviceHealthChecker();
    }
    return MicroserviceHealthChecker.instance;
  }

  async checkHealth(serviceName: string): Promise<'healthy' | 'degraded' | 'down'> {
    const config = LOGISTICS_MICROSERVICES[serviceName];
    if (!config) return 'down';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(`${config.endpoint}${config.healthCheck}`, {
        signal: controller.signal,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        this.healthStatus.set(serviceName, 'healthy');
        return 'healthy';
      } else {
        this.healthStatus.set(serviceName, 'degraded');
        return 'degraded';
      }
    } catch (error) {
      this.healthStatus.set(serviceName, 'down');
      return 'down';
    }
  }

  async checkAllServices(): Promise<Record<string, 'healthy' | 'degraded' | 'down'>> {
    const results: Record<string, 'healthy' | 'degraded' | 'down'> = {};
    
    await Promise.all(
      Object.keys(LOGISTICS_MICROSERVICES).map(async (serviceName) => {
        results[serviceName] = await this.checkHealth(serviceName);
      })
    );

    return results;
  }
}

export class LogisticsMicroserviceClient {
  private static instance: LogisticsMicroserviceClient;

  static getInstance(): LogisticsMicroserviceClient {
    if (!LogisticsMicroserviceClient.instance) {
      LogisticsMicroserviceClient.instance = new LogisticsMicroserviceClient();
    }
    return LogisticsMicroserviceClient.instance;
  }

  async callService<T>(
    serviceName: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config = LOGISTICS_MICROSERVICES[serviceName];
    if (!config) {
      throw new Error(`Service ${serviceName} not configured`);
    }

    const url = `${config.endpoint}/${config.version}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  // Shipment Service Methods
  async createShipment(shipmentData: any) {
    return this.callService('SHIPMENT_SERVICE', '/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData)
    });
  }

  async updateShipmentStatus(shipmentId: string, status: string) {
    return this.callService('SHIPMENT_SERVICE', `/shipments/${shipmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async getShipmentDetails(shipmentId: string) {
    return this.callService('SHIPMENT_SERVICE', `/shipments/${shipmentId}`);
  }

  // Tracking Service Methods
  async trackShipment(trackingNumber: string) {
    return this.callService('TRACKING_SERVICE', `/track/${trackingNumber}`);
  }

  async updateShipmentLocation(shipmentId: string, location: any) {
    return this.callService('TRACKING_SERVICE', `/shipments/${shipmentId}/location`, {
      method: 'POST',
      body: JSON.stringify(location)
    });
  }

  async getTrackingHistory(shipmentId: string) {
    return this.callService('TRACKING_SERVICE', `/shipments/${shipmentId}/history`);
  }

  // Routing Service Methods
  async optimizeRoute(routeData: any) {
    return this.callService('ROUTING_SERVICE', '/optimize', {
      method: 'POST',
      body: JSON.stringify(routeData)
    });
  }

  async calculateDistance(origin: any, destination: any) {
    return this.callService('ROUTING_SERVICE', '/distance', {
      method: 'POST',
      body: JSON.stringify({ origin, destination })
    });
  }

  async getOptimalPickupSequence(pickups: any[]) {
    return this.callService('ROUTING_SERVICE', '/sequence', {
      method: 'POST',
      body: JSON.stringify({ pickups })
    });
  }

  // Fleet Service Methods
  async getFleetStatus() {
    return this.callService('FLEET_SERVICE', '/fleet/status');
  }

  async assignVehicle(shipmentId: string, vehicleId: string) {
    return this.callService('FLEET_SERVICE', '/assignments', {
      method: 'POST',
      body: JSON.stringify({ shipmentId, vehicleId })
    });
  }

  async updateVehicleLocation(vehicleId: string, location: any) {
    return this.callService('FLEET_SERVICE', `/vehicles/${vehicleId}/location`, {
      method: 'POST',
      body: JSON.stringify(location)
    });
  }

  async getVehiclePerformance(vehicleId: string) {
    return this.callService('FLEET_SERVICE', `/vehicles/${vehicleId}/performance`);
  }

  // Notification Service Methods
  async sendNotification(notification: any) {
    return this.callService('NOTIFICATION_SERVICE', '/notifications', {
      method: 'POST',
      body: JSON.stringify(notification)
    });
  }

  async subscribeToUpdates(shipmentId: string, channels: string[]) {
    return this.callService('NOTIFICATION_SERVICE', '/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ shipmentId, channels })
    });
  }

  async getNotificationHistory(userId: string) {
    return this.callService('NOTIFICATION_SERVICE', `/users/${userId}/notifications`);
  }
}

// Analytics and Reporting Service
interface CostAnalysisResponse {
  totalCost: number;
  [key: string]: any;
}

export class LogisticsAnalyticsService {
  private client: LogisticsMicroserviceClient;

  constructor() {
    this.client = LogisticsMicroserviceClient.getInstance();
  }

  async getDeliveryPerformance(timeRange: { start: Date; end: Date }) {
    // Aggregate data from multiple services
    const [shipments, tracking, fleet] = await Promise.all([
      this.client.callService('SHIPMENT_SERVICE', `/analytics/performance?start=${timeRange.start.toISOString()}&end=${timeRange.end.toISOString()}`),
      this.client.callService('TRACKING_SERVICE', `/analytics/delivery-times?start=${timeRange.start.toISOString()}&end=${timeRange.end.toISOString()}`),
      this.client.callService('FLEET_SERVICE', `/analytics/utilization?start=${timeRange.start.toISOString()}&end=${timeRange.end.toISOString()}`)
    ]);

    return {
      shipmentMetrics: shipments,
      deliveryTimes: tracking,
      fleetUtilization: fleet
    };
  }

  async getCostAnalysis(timeRange: { start: Date; end: Date }) {
    const [routing, fleet] = await Promise.all([
      this.client.callService<CostAnalysisResponse>('ROUTING_SERVICE', `/analytics/costs?start=${timeRange.start.toISOString()}&end=${timeRange.end.toISOString()}`),
      this.client.callService<CostAnalysisResponse>('FLEET_SERVICE', `/analytics/costs?start=${timeRange.start.toISOString()}&end=${timeRange.end.toISOString()}`)
    ]);

    return {
      routingCosts: routing,
      fleetCosts: fleet,
      totalCost: routing.totalCost + fleet.totalCost
    };
  }

  async getEfficiencyMetrics() {
    const [routing, fleet, tracking] = await Promise.all([
      this.client.callService<{ efficiency: number }>('ROUTING_SERVICE', '/metrics/efficiency'),
      this.client.callService<{ efficiency: number }>('FLEET_SERVICE', '/metrics/efficiency'),
      this.client.callService<{ accuracy: number }>('TRACKING_SERVICE', '/metrics/accuracy')
    ]);

    return {
      routeEfficiency: routing.efficiency,
      fleetEfficiency: fleet.efficiency,
      trackingAccuracy: tracking.accuracy,
      overallScore: (routing.efficiency + fleet.efficiency + tracking.accuracy) / 3
    };
  }
}

export const microserviceClient = LogisticsMicroserviceClient.getInstance();
export const healthChecker = MicroserviceHealthChecker.getInstance();
export const analyticsService = new LogisticsAnalyticsService();
