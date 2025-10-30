import { BaseAgent, AgentMessage, AgentCapability } from './agent-orchestrator';

export class InventoryAgent extends BaseAgent {
  private inventoryData: Map<string, any> = new Map();
  private reorderRules: Map<string, any> = new Map();
  private demandPatterns: Map<string, number[]> = new Map();

  constructor() {
    super('inventory-agent', 'Inventory Optimization Agent');
    
    this.capabilities = [
      {
        name: 'optimize_reorder_points',
        description: 'Calculate optimal reorder points based on demand patterns',
        inputSchema: { itemId: 'string', historicalData: 'array' },
        outputSchema: { reorderPoint: 'number', confidence: 'number' }
      },
      {
        name: 'forecast_demand',
        description: 'Predict future demand for items',
        inputSchema: { itemId: 'string', forecastHorizon: 'number' },
        outputSchema: { forecast: 'array', accuracy: 'number' }
      },
      {
        name: 'abc_analysis',
        description: 'Perform ABC analysis on inventory items',
        inputSchema: { items: 'array' },
        outputSchema: { classification: 'object' }
      },
      {
        name: 'stock_optimization',
        description: 'Optimize stock levels across warehouse',
        inputSchema: { constraints: 'object' },
        outputSchema: { recommendations: 'array' }
      }
    ];
  }

  async initialize(): Promise<void> {
    await this.loadInventoryData();
    await this.loadDemandPatterns();
    this.startPeriodicOptimization();
  }

  async processMessage(message: AgentMessage): Promise<any> {
    const { capability, parameters } = message.payload;

    switch (capability) {
      case 'optimize_reorder_points':
        return await this.optimizeReorderPoints(parameters.itemId, parameters.historicalData);
      
      case 'forecast_demand':
        return await this.forecastDemand(parameters.itemId, parameters.forecastHorizon);
      
      case 'abc_analysis':
        return await this.performABCAnalysis(parameters.items);
      
      case 'stock_optimization':
        return await this.optimizeStockLevels(parameters.constraints);
      
      default:
        if (message.type === 'notification') {
          await this.handleNotification(message);
        }
        return null;
    }
  }

  getStatus(): Record<string, any> {
    return {
      trackedItems: this.inventoryData.size,
      reorderRules: this.reorderRules.size,
      demandPatterns: this.demandPatterns.size,
      lastOptimization: new Date().toISOString(),
      performance: this.calculatePerformanceMetrics()
    };
  }

  private async loadInventoryData(): Promise<void> {
    // Mock inventory data loading
    const mockItems = [
      { id: 'item-1', sku: 'SKU001', currentStock: 150, minStock: 50, maxStock: 300 },
      { id: 'item-2', sku: 'SKU002', currentStock: 75, minStock: 25, maxStock: 200 },
      { id: 'item-3', sku: 'SKU003', currentStock: 200, minStock: 100, maxStock: 500 }
    ];

    for (const item of mockItems) {
      this.inventoryData.set(item.id, item);
    }
  }

  private async loadDemandPatterns(): Promise<void> {
    // Mock demand pattern data
    const mockPatterns = new Map([
      ['item-1', [10, 12, 15, 8, 20, 18, 14, 16, 11, 13, 17, 19]],
      ['item-2', [5, 7, 6, 9, 8, 10, 7, 6, 8, 9, 11, 12]],
      ['item-3', [25, 30, 28, 35, 32, 40, 38, 33, 29, 31, 36, 42]]
    ]);

    this.demandPatterns = mockPatterns;
  }

  private async optimizeReorderPoints(itemId: string, historicalData: number[]): Promise<any> {
    const item = this.inventoryData.get(itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    const demandPattern = this.demandPatterns.get(itemId) || historicalData;
    
    // Calculate statistics
    const avgDemand = demandPattern.reduce((sum, val) => sum + val, 0) / demandPattern.length;
    const variance = demandPattern.reduce((sum, val) => sum + Math.pow(val - avgDemand, 2), 0) / demandPattern.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate optimal reorder point (simplified formula)
    const leadTime = 7; // days
    const serviceLevel = 0.95; // 95% service level
    const zScore = 1.645; // for 95% service level
    
    const reorderPoint = Math.ceil((avgDemand * leadTime) + (zScore * stdDev * Math.sqrt(leadTime)));
    const confidence = Math.max(0, Math.min(1, 1 - (stdDev / avgDemand)));

    // Update reorder rule
    this.reorderRules.set(itemId, {
      reorderPoint,
      avgDemand,
      stdDev,
      confidence,
      lastUpdated: new Date()
    });

    return { reorderPoint, confidence };
  }

  private async forecastDemand(itemId: string, forecastHorizon: number): Promise<any> {
    const demandPattern = this.demandPatterns.get(itemId);
    if (!demandPattern) {
      throw new Error(`No demand pattern found for item ${itemId}`);
    }

    // Simple moving average forecast with trend
    const windowSize = Math.min(6, demandPattern.length);
    const recentDemand = demandPattern.slice(-windowSize);
    const avgDemand = recentDemand.reduce((sum, val) => sum + val, 0) / recentDemand.length;
    
    // Calculate trend
    let trend = 0;
    if (recentDemand.length > 1) {
      const firstHalf = recentDemand.slice(0, Math.floor(recentDemand.length / 2));
      const secondHalf = recentDemand.slice(Math.floor(recentDemand.length / 2));
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      trend = (secondAvg - firstAvg) / firstHalf.length;
    }

    // Generate forecast
    const forecast = [];
    for (let i = 0; i < forecastHorizon; i++) {
      const seasonalFactor = 1 + 0.1 * Math.sin((i / 12) * 2 * Math.PI); // Simple seasonality
      const noise = (Math.random() - 0.5) * 0.1 * avgDemand; // Random noise
      const forecastValue = Math.max(0, (avgDemand + trend * i) * seasonalFactor + noise);
      forecast.push(Math.round(forecastValue));
    }

    // Calculate accuracy based on historical performance
    const accuracy = this.calculateForecastAccuracy(itemId);

    return { forecast, accuracy };
  }

  private async performABCAnalysis(items: any[]): Promise<any> {
    // Calculate annual usage value for each item
    const itemsWithValue = items.map(item => {
      const demandPattern = this.demandPatterns.get(item.id) || [10];
      const annualDemand = demandPattern.reduce((sum, val) => sum + val, 0) * (12 / demandPattern.length);
      const unitCost = item.unitCost || 10; // Default unit cost
      const annualValue = annualDemand * unitCost;
      
      return { ...item, annualValue, annualDemand };
    });

    // Sort by annual value (descending)
    itemsWithValue.sort((a, b) => b.annualValue - a.annualValue);

    // Calculate cumulative percentages
    const totalValue = itemsWithValue.reduce((sum, item) => sum + item.annualValue, 0);
    let cumulativeValue = 0;
    
    const classification = {
      A: [] as any[],
      B: [] as any[],
      C: [] as any[]
    };

    for (const item of itemsWithValue) {
      cumulativeValue += item.annualValue;
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;
      
      if (cumulativePercentage <= 80) {
        classification.A.push({ ...item, class: 'A', cumulativePercentage });
      } else if (cumulativePercentage <= 95) {
        classification.B.push({ ...item, class: 'B', cumulativePercentage });
      } else {
        classification.C.push({ ...item, class: 'C', cumulativePercentage });
      }
    }

    return { classification };
  }

  private async optimizeStockLevels(constraints: any): Promise<any> {
    const recommendations = [];
    
    for (const [itemId, item] of this.inventoryData) {
      const reorderRule = this.reorderRules.get(itemId);
      const demandPattern = this.demandPatterns.get(itemId);
      
      if (!reorderRule || !demandPattern) continue;

      const currentStock = item.currentStock;
      const reorderPoint = reorderRule.reorderPoint;
      const avgDemand = reorderRule.avgDemand;
      
      // Calculate optimal max stock (Economic Order Quantity approach)
      const orderingCost = constraints.orderingCost || 50;
      const holdingCost = constraints.holdingCost || 2;
      const annualDemand = avgDemand * 365;
      
      const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
      const optimalMaxStock = reorderPoint + eoq;

      let recommendation = null;
      
      if (currentStock <= reorderPoint) {
        recommendation = {
          type: 'REORDER',
          itemId,
          sku: item.sku,
          currentStock,
          reorderPoint,
          suggestedOrderQuantity: Math.ceil(eoq),
          priority: currentStock < (reorderPoint * 0.5) ? 'HIGH' : 'MEDIUM',
          reason: 'Stock below reorder point'
        };
      } else if (currentStock > optimalMaxStock * 1.5) {
        recommendation = {
          type: 'REDUCE_STOCK',
          itemId,
          sku: item.sku,
          currentStock,
          optimalMaxStock: Math.ceil(optimalMaxStock),
          excessQuantity: Math.ceil(currentStock - optimalMaxStock),
          priority: 'LOW',
          reason: 'Excess inventory detected'
        };
      } else if (Math.abs(item.maxStock - optimalMaxStock) > optimalMaxStock * 0.2) {
        recommendation = {
          type: 'ADJUST_PARAMETERS',
          itemId,
          sku: item.sku,
          currentMaxStock: item.maxStock,
          suggestedMaxStock: Math.ceil(optimalMaxStock),
          suggestedMinStock: Math.ceil(reorderPoint),
          priority: 'LOW',
          reason: 'Stock parameters need adjustment'
        };
      }

      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    // Sort by priority
    const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    recommendations.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0));

    return { recommendations };
  }

  private async handleNotification(message: AgentMessage): Promise<void> {
    const { type, data } = message.payload;

    switch (type) {
      case 'stock_movement':
        await this.updateStockLevel(data.itemId, data.quantity, data.movementType);
        break;
      
      case 'new_demand_data':
        await this.updateDemandPattern(data.itemId, data.demandData);
        break;
      
      case 'supplier_update':
        await this.updateSupplierInfo(data.supplierId, data.leadTime, data.reliability);
        break;
    }
  }

  private async updateStockLevel(itemId: string, quantity: number, movementType: string): Promise<void> {
    const item = this.inventoryData.get(itemId);
    if (!item) return;

    if (movementType === 'INBOUND') {
      item.currentStock += quantity;
    } else if (movementType === 'OUTBOUND') {
      item.currentStock = Math.max(0, item.currentStock - quantity);
    }

    this.inventoryData.set(itemId, item);

    // Check if reorder is needed
    const reorderRule = this.reorderRules.get(itemId);
    if (reorderRule && item.currentStock <= reorderRule.reorderPoint) {
      await this.sendMessage('procurement-agent', 'notification', {
        type: 'reorder_needed',
        itemId,
        currentStock: item.currentStock,
        reorderPoint: reorderRule.reorderPoint
      });
    }
  }

  private async updateDemandPattern(itemId: string, newDemandData: number[]): Promise<void> {
    const existingPattern = this.demandPatterns.get(itemId) || [];
    const updatedPattern = [...existingPattern, ...newDemandData].slice(-24); // Keep last 24 periods
    
    this.demandPatterns.set(itemId, updatedPattern);
    
    // Recalculate reorder point with new data
    await this.optimizeReorderPoints(itemId, updatedPattern);
  }

  private async updateSupplierInfo(supplierId: string, leadTime: number, reliability: number): Promise<void> {
    // Update supplier information and recalculate affected reorder points
    for (const [itemId, rule] of this.reorderRules) {
      const item = this.inventoryData.get(itemId);
      if (item && item.supplierId === supplierId) {
        // Adjust reorder point based on new lead time and reliability
        const adjustmentFactor = (leadTime / 7) * (2 - reliability); // Normalize to 7-day baseline
        rule.reorderPoint = Math.ceil(rule.reorderPoint * adjustmentFactor);
        rule.lastUpdated = new Date();
        this.reorderRules.set(itemId, rule);
      }
    }
  }

  private calculateForecastAccuracy(itemId: string): number {
    // Simplified accuracy calculation
    // In production, this would compare historical forecasts with actual demand
    const demandPattern = this.demandPatterns.get(itemId);
    if (!demandPattern || demandPattern.length < 2) return 0.5;

    const variance = demandPattern.reduce((sum, val, i, arr) => {
      if (i === 0) return sum;
      return sum + Math.abs(val - arr[i - 1]);
    }, 0) / (demandPattern.length - 1);

    const avgDemand = demandPattern.reduce((sum, val) => sum + val, 0) / demandPattern.length;
    const stability = Math.max(0, 1 - (variance / avgDemand));
    
    return Math.min(0.95, 0.5 + (stability * 0.45)); // Scale to 50-95% accuracy
  }

  private calculatePerformanceMetrics(): Record<string, any> {
    let totalAccuracy = 0;
    let stockoutRisk = 0;
    let overstockItems = 0;

    for (const [itemId, item] of this.inventoryData) {
      const reorderRule = this.reorderRules.get(itemId);
      if (reorderRule) {
        totalAccuracy += reorderRule.confidence;
        
        if (item.currentStock <= reorderRule.reorderPoint) {
          stockoutRisk++;
        }
        
        if (item.maxStock && item.currentStock > item.maxStock * 1.2) {
          overstockItems++;
        }
      }
    }

    return {
      averageAccuracy: this.inventoryData.size > 0 ? totalAccuracy / this.inventoryData.size : 0,
      stockoutRisk: (stockoutRisk / this.inventoryData.size) * 100,
      overstockPercentage: (overstockItems / this.inventoryData.size) * 100,
      optimizationCoverage: (this.reorderRules.size / this.inventoryData.size) * 100
    };
  }

  private startPeriodicOptimization(): void {
    // Run optimization every hour
    setInterval(async () => {
      if (this.isActive) {
        try {
          // Broadcast optimization results to other agents
          const recommendations = await this.optimizeStockLevels({});
          await this.broadcastMessage('notification', {
            type: 'inventory_optimization_complete',
            recommendations: recommendations.recommendations,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('Periodic optimization failed:', error);
        }
      }
    }, 60 * 60 * 1000); // 1 hour
  }
}