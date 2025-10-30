import { EventEmitter } from 'events';

export interface TwinEntity {
  id: string;
  type: 'warehouse' | 'robot' | 'bin' | 'item' | 'sensor';
  physicalState: Record<string, any>;
  virtualState: Record<string, any>;
  predictions: Record<string, any>;
  confidence: number;
  lastSync: Date;
}

export class DigitalTwinEngine extends EventEmitter {
  private entities: Map<string, TwinEntity> = new Map();
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  async initialize() {
    this.startSynchronization();
    this.isRunning = true;
    this.emit('initialized');
  }

  async createTwin(entityType: string, entityId: string, initialState: Record<string, any>): Promise<TwinEntity> {
    const twin: TwinEntity = {
      id: `${entityType}-${entityId}`,
      type: entityType as any,
      physicalState: initialState,
      virtualState: { ...initialState },
      predictions: {},
      confidence: 1.0,
      lastSync: new Date()
    };

    this.entities.set(twin.id, twin);
    this.emit('twinCreated', twin);
    return twin;
  }

  async updatePhysicalState(entityId: string, state: Record<string, any>) {
    const twin = this.entities.get(entityId);
    if (!twin) return;

    twin.physicalState = { ...twin.physicalState, ...state };
    twin.lastSync = new Date();
    await this.updatePredictions(twin);
    this.emit('physicalStateUpdated', twin);
  }

  async runSimulation(params: any): Promise<any> {
    const results: {
      scenarios: any[];
      predictions: Record<string, any>;
      recommendations: string[];
      confidence: number;
    } = {
      scenarios: [],
      predictions: {},
      recommendations: [],
      confidence: 0
    };

    for (const scenario of params.scenarios || []) {
      const scenarioResult = await this.simulateScenario(scenario, params);
      results.scenarios.push(scenarioResult);
    }

    results.recommendations = this.generateRecommendations(results.scenarios);
    results.confidence = this.calculateOverallConfidence(results.scenarios);
    
    this.emit('simulationCompleted', results);
    return results;
  }

  private async simulateScenario(scenario: string, params: any) {
    const virtualEntities = new Map();
    for (const [id, entity] of this.entities) {
      virtualEntities.set(id, { ...entity, virtualState: { ...entity.virtualState } });
    }

    const timeSteps = (params.timeHorizon || 1) * 60;
    const results = [];

    for (let step = 0; step < timeSteps; step++) {
      const stepResult = await this.simulateTimeStep(virtualEntities, step);
      results.push(stepResult);
    }

    return {
      scenario,
      steps: results,
      summary: this.summarizeScenarioResults(results)
    };
  }

  private async simulateTimeStep(entities: Map<string, TwinEntity>, step: number) {
    const stepResults: {
      step: number;
      timestamp: Date;
      entityStates: Record<string, any>;
      metrics: Record<string, any>;
    } = {
      step,
      timestamp: new Date(Date.now() + step * 60000),
      entityStates: {},
      metrics: {}
    };

    for (const [id, entity] of entities) {
      const newState = await this.predictNextState(entity, step);
      entity.virtualState = newState;
      stepResults.entityStates[id] = newState;
    }

    stepResults.metrics = this.calculateSystemMetrics(entities);
    return stepResults;
  }

  private async predictNextState(entity: TwinEntity, step: number): Promise<Record<string, any>> {
    const newState = { ...entity.virtualState };

    switch (entity.type) {
      case 'robot':
        if (newState.status === 'WORKING' && newState.currentTask) {
          newState.taskProgress = Math.min((newState.taskProgress || 0) + 0.1, 1.0);
          if (newState.taskProgress >= 1.0) {
            newState.status = 'IDLE';
            newState.currentTask = null;
            newState.tasksCompleted = (newState.tasksCompleted || 0) + 1;
          }
        }
        if (newState.batteryLevel !== undefined) {
          const drainRate = newState.status === 'WORKING' ? 0.5 : 0.1;
          newState.batteryLevel = Math.max(newState.batteryLevel - drainRate, 0);
        }
        break;
      case 'bin':
        const utilizationTrend = newState.utilizationTrend || 0;
        const randomVariation = (Math.random() - 0.5) * 0.1;
        newState.predictedUtilization = Math.max(0, Math.min(1, 
          (newState.currentLoad / newState.capacity) + utilizationTrend + randomVariation
        ));
        break;
    }

    return newState;
  }

  private calculateSystemMetrics(entities: Map<string, TwinEntity>): Record<string, any> {
    const robots = Array.from(entities.values()).filter(e => e.type === 'robot');
    const bins = Array.from(entities.values()).filter(e => e.type === 'bin');

    return {
      robotUtilization: robots.length > 0 ? 
        robots.filter(r => r.virtualState.status === 'WORKING').length / robots.length : 0,
      averageBinUtilization: bins.length > 0 ?
        bins.reduce((sum, b) => sum + (b.virtualState.currentLoad / b.virtualState.capacity || 0), 0) / bins.length : 0,
      totalThroughput: robots.reduce((sum, r) => sum + (r.virtualState.tasksCompleted || 0), 0)
    };
  }

  private async updatePredictions(twin: TwinEntity) {
    twin.predictions = {
      nextHourState: await this.predictFutureState(twin, 60),
      anomalyScore: this.calculateAnomalyScore(twin),
      maintenanceNeeded: this.predictMaintenanceNeeds(twin)
    };
    twin.confidence = this.calculatePredictionConfidence(twin);
  }

  private async predictFutureState(twin: TwinEntity, minutes: number): Promise<Record<string, any>> {
    const futureState = { ...twin.virtualState };
    
    if (twin.type === 'robot' && futureState.batteryLevel) {
      const drainRate = 0.5;
      futureState.batteryLevel = Math.max(0, futureState.batteryLevel - (drainRate * minutes));
    }

    return futureState;
  }

  private calculateAnomalyScore(twin: TwinEntity): number {
    const stateVector = Object.values(twin.physicalState).filter(v => typeof v === 'number');
    const virtualVector = Object.values(twin.virtualState).filter(v => typeof v === 'number');
    
    if (stateVector.length !== virtualVector.length) return 0;
    
    const mse = stateVector.reduce((sum, val, i) => {
      const diff = val - virtualVector[i];
      return sum + (diff * diff);
    }, 0) / stateVector.length;

    return Math.min(mse / 100, 1.0);
  }

  private predictMaintenanceNeeds(twin: TwinEntity): boolean {
    if (twin.type !== 'robot') return false;
    
    const uptime = twin.physicalState.uptime || 0;
    const errorRate = twin.physicalState.errorRate || 0;
    
    return uptime > 720 || errorRate > 0.1;
  }

  private calculatePredictionConfidence(twin: TwinEntity): number {
    const dataQuality = twin.physicalState.dataQuality || 1.0;
    const syncRecency = Math.max(0, 1 - (Date.now() - twin.lastSync.getTime()) / (5 * 60 * 1000));
    const anomalyScore = twin.predictions.anomalyScore || 0;
    
    return Math.max(0, Math.min(1, dataQuality * syncRecency * (1 - anomalyScore)));
  }

  private startSynchronization() {
    this.syncInterval = setInterval(async () => {
      for (const twin of this.entities.values()) {
        await this.updatePredictions(twin);
      }
    }, 5000);
  }

  private summarizeScenarioResults(results: any[]): Record<string, any> {
    const finalStep = results[results.length - 1];
    
    return {
      finalMetrics: finalStep?.metrics || {},
      totalThroughput: finalStep?.metrics?.totalThroughput || 0,
      averageUtilization: finalStep?.metrics?.robotUtilization || 0,
      efficiency: this.calculateEfficiencyScore(results)
    };
  }

  private calculateEfficiencyScore(results: any[]): number {
    if (results.length === 0) return 0;
    
    const avgThroughput = results.reduce((sum, step) => sum + (step.metrics?.totalThroughput || 0), 0) / results.length;
    const avgUtilization = results.reduce((sum, step) => sum + (step.metrics?.robotUtilization || 0), 0) / results.length;
    
    return (avgThroughput * 0.5 + avgUtilization * 0.5);
  }

  private generateRecommendations(scenarios: any[]): string[] {
    const recommendations = [];
    
    for (const scenario of scenarios) {
      const efficiency = scenario.summary?.efficiency || 0;
      const utilization = scenario.summary?.averageUtilization || 0;
      
      if (efficiency < 0.7) {
        recommendations.push(`Improve efficiency in ${scenario.scenario} scenario`);
      }
      
      if (utilization > 0.9) {
        recommendations.push(`Consider additional resources for ${scenario.scenario} scenario`);
      }
    }
    
    return recommendations;
  }

  private calculateOverallConfidence(scenarios: any[]): number {
    if (scenarios.length === 0) return 0;
    
    return scenarios.reduce((sum, scenario) => {
      return sum + (scenario.summary?.efficiency || 0);
    }, 0) / scenarios.length;
  }

  async shutdown() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.isRunning = false;
    this.emit('shutdown');
  }

  getTwin(entityId: string): TwinEntity | undefined {
    return this.entities.get(entityId);
  }

  getAllTwins(): TwinEntity[] {
    return Array.from(this.entities.values());
  }

  getSystemHealth(): Record<string, any> {
    const twins = this.getAllTwins();
    const avgConfidence = twins.length > 0 ? twins.reduce((sum, twin) => sum + twin.confidence, 0) / twins.length : 0;
    const syncedRecently = twins.filter(twin => 
      Date.now() - twin.lastSync.getTime() < 60000
    ).length;
    
    return {
      totalTwins: twins.length,
      averageConfidence: avgConfidence,
      recentlySynced: syncedRecently,
      syncPercentage: twins.length > 0 ? (syncedRecently / twins.length) * 100 : 0,
      isRunning: this.isRunning
    };
  }
}