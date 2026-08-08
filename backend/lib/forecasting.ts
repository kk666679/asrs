import * as tf from '@tensorflow/tfjs';

export interface ForecastResult {
  predictions: number[];
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonality: boolean;
}

export class DemandForecaster {
  private model: tf.LayersModel | null = null;

  async forecast(historicalData: number[], days: number = 30): Promise<ForecastResult> {
    if (historicalData.length < 7) {
      throw new Error('Insufficient historical data. Minimum 7 days required.');
    }

    const normalized = this.normalizeData(historicalData);
    const predictions = await this.generatePredictions(normalized, days);
    const denormalized = this.denormalizeData(predictions, historicalData);
    
    return {
      predictions: denormalized,
      confidence: this.calculateConfidence(historicalData),
      trend: this.detectTrend(denormalized),
      seasonality: this.detectSeasonality(historicalData)
    };
  }

  private normalizeData(data: number[]): number[] {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    return data.map(v => (v - min) / range);
  }

  private denormalizeData(normalized: number[], original: number[]): number[] {
    const max = Math.max(...original);
    const min = Math.min(...original);
    const range = max - min || 1;
    return normalized.map(v => Math.round(v * range + min));
  }

  private async generatePredictions(data: number[], days: number): Promise<number[]> {
    const windowSize = Math.min(7, data.length);
    const predictions: number[] = [];
    let current = [...data];

    for (let i = 0; i < days; i++) {
      const window = current.slice(-windowSize);
      const prediction = this.simpleMovingAverage(window);
      predictions.push(prediction);
      current.push(prediction);
    }

    return predictions;
  }

  private simpleMovingAverage(data: number[]): number {
    const weights = data.map((_, i) => i + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weighted = data.reduce((sum, val, i) => sum + val * weights[i], 0);
    return weighted / totalWeight;
  }

  private calculateConfidence(data: number[]): number {
    if (data.length < 2) return 0.5;
    
    const variance = this.calculateVariance(data);
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const cv = Math.sqrt(variance) / (mean || 1);
    
    return Math.max(0.3, Math.min(0.95, 1 - cv));
  }

  private calculateVariance(data: number[]): number {
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    return data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  }

  private detectTrend(predictions: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (predictions.length < 2) return 'stable';
    
    const first = predictions.slice(0, Math.floor(predictions.length / 3));
    const last = predictions.slice(-Math.floor(predictions.length / 3));
    
    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const lastAvg = last.reduce((a, b) => a + b, 0) / last.length;
    
    const change = (lastAvg - firstAvg) / (firstAvg || 1);
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private detectSeasonality(data: number[]): boolean {
    if (data.length < 14) return false;
    
    const weeklyPattern = this.calculateAutocorrelation(data, 7);
    return weeklyPattern > 0.6;
  }

  private calculateAutocorrelation(data: number[], lag: number): number {
    if (data.length <= lag) return 0;
    
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    let numerator = 0;
    let denominator = 0;
    
    for (let i = 0; i < data.length - lag; i++) {
      numerator += (data[i] - mean) * (data[i + lag] - mean);
    }
    
    for (let i = 0; i < data.length; i++) {
      denominator += Math.pow(data[i] - mean, 2);
    }
    
    return denominator === 0 ? 0 : numerator / denominator;
  }
}
