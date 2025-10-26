import * as tf from '@tensorflow/tfjs';
import { prisma } from './db';

export interface ForecastData {
  itemId: string;
  itemName: string;
  sku: string;
  historicalData: Array<{
    date: string;
    quantity: number;
  }>;
  forecast: Array<{
    date: string;
    predictedQuantity: number;
    confidence: number;
  }>;
  accuracy: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export class DemandForecaster {
  private model: tf.Sequential | null = null;

  async initializeModel() {
    if (this.model) return this.model;

    // Create a simple LSTM model for time series forecasting
    this.model = tf.sequential();

    // LSTM layer for sequence processing
    this.model.add(tf.layers.lstm({
      units: 50,
      inputShape: [30, 1], // 30 days of historical data
      returnSequences: false
    }));

    // Dense layers
    this.model.add(tf.layers.dense({ units: 25, activation: 'relu' }));
    this.model.add(tf.layers.dense({ units: 1 }));

    // Compile the model
    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });

    return this.model;
  }

  async generateForecast(itemId: string, daysAhead: number = 30): Promise<ForecastData | null> {
    try {
      // Get historical movement data for the item
      const movements = await prisma.movement.findMany({
        where: {
          binItem: {
            itemId: itemId
          },
          type: 'PICKING',
          timestamp: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        },
        select: {
          quantity: true,
          timestamp: true,
          binItem: {
            select: {
              item: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              }
            }
          }
        },
        orderBy: { timestamp: 'asc' }
      });

      if (movements.length < 30) {
        // Not enough data for forecasting
        return null;
      }

      // Aggregate daily quantities
      const dailyData = this.aggregateDailyData(movements);

      if (dailyData.length < 30) {
        return null;
      }

      // Prepare data for the model
      const { features, labels } = this.prepareTrainingData(dailyData);

      if (features.length === 0) {
        return null;
      }

      // Initialize and train the model
      const model = await this.initializeModel();

      // Convert to tensors
      const xs = tf.tensor3d(features);
      const ys = tf.tensor2d(labels, [labels.length, 1]);

      // Train the model (simple training for demo)
      await model.fit(xs, ys, {
        epochs: 10,
        batchSize: 8,
        verbose: 0
      });

      // Generate forecast
      const last30Days = dailyData.slice(-30).map(d => d.quantity);
      const forecast = await this.predictFuture(model, last30Days, daysAhead);

      // Calculate trend
      const trend = this.calculateTrend(dailyData);

      // Calculate accuracy (simplified - using recent data)
      const accuracy = this.calculateAccuracy(dailyData);

      return {
        itemId,
        itemName: movements[0].binItem.item.name,
        sku: movements[0].binItem.item.sku,
        historicalData: dailyData.map(d => ({
          date: d.date.toISOString().split('T')[0],
          quantity: d.quantity
        })),
        forecast: forecast.map((f, i) => ({
          date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          predictedQuantity: Math.max(0, Math.round(f.prediction)),
          confidence: f.confidence
        })),
        accuracy,
        trend
      };

    } catch (error) {
      console.error('Error generating forecast:', error);
      return null;
    }
  }

  private aggregateDailyData(movements: any[]): Array<{ date: Date; quantity: number }> {
    const dailyMap = new Map<string, number>();

    movements.forEach(movement => {
      const date = movement.timestamp.toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + movement.quantity);
    });

    return Array.from(dailyMap.entries())
      .map(([date, quantity]) => ({
        date: new Date(date),
        quantity
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  private prepareTrainingData(dailyData: Array<{ date: Date; quantity: number }>) {
    const features: number[][][] = [];
    const labels: number[] = [];

    for (let i = 30; i < dailyData.length; i++) {
      const sequence = dailyData.slice(i - 30, i).map(d => [d.quantity]);
      features.push(sequence);
      labels.push(dailyData[i].quantity);
    }

    return { features, labels };
  }

  private async predictFuture(model: tf.Sequential, last30Days: number[], daysAhead: number) {
    const predictions: Array<{ prediction: number; confidence: number }> = [];

    let currentSequence = [...last30Days];

    for (let i = 0; i < daysAhead; i++) {
      // Prepare input tensor
      const input = tf.tensor3d([currentSequence.map(v => [v])]);

      // Make prediction
      const prediction = model.predict(input) as tf.Tensor;
      const predictedValue = (await prediction.data())[0];

      // Calculate confidence (simplified)
      const confidence = Math.max(0.1, Math.min(0.9, 1 - Math.abs(predictedValue - currentSequence[currentSequence.length - 1]) / Math.max(...currentSequence)));

      predictions.push({
        prediction: predictedValue,
        confidence: Math.round(confidence * 100) / 100
      });

      // Update sequence for next prediction
      currentSequence.shift();
      currentSequence.push(predictedValue);

      // Clean up tensors
      input.dispose();
      prediction.dispose();
    }

    return predictions;
  }

  private calculateTrend(dailyData: Array<{ date: Date; quantity: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (dailyData.length < 14) return 'stable';

    const recent = dailyData.slice(-14);
    const earlier = dailyData.slice(-28, -14);

    const recentAvg = recent.reduce((sum, d) => sum + d.quantity, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, d) => sum + d.quantity, 0) / earlier.length;

    const change = (recentAvg - earlierAvg) / earlierAvg;

    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateAccuracy(dailyData: Array<{ date: Date; quantity: number }>): number {
    // Simplified accuracy calculation
    // In a real implementation, you'd use proper cross-validation
    if (dailyData.length < 60) return 0.7; // Default accuracy

    const recent = dailyData.slice(-30);
    const mean = recent.reduce((sum, d) => sum + d.quantity, 0) / recent.length;
    const variance = recent.reduce((sum, d) => sum + Math.pow(d.quantity - mean, 2), 0) / recent.length;
    const stdDev = Math.sqrt(variance);

    // Lower variance = higher accuracy
    const accuracy = Math.max(0.5, Math.min(0.95, 1 - (stdDev / mean)));
    return Math.round(accuracy * 100) / 100;
  }
}

// Singleton instance
export const forecaster = new DemandForecaster();
