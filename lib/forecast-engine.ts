function hashSeed(id: string): number {
  return id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

export function generateForecast(itemId: string, itemName: string, sku: string, days: number) {
  const seed = hashSeed(itemId);
  const baseQty = 10 + (seed % 40);
  const trendIndex = seed % 3; // 0=stable, 1=increasing, 2=decreasing
  const trendFactor = trendIndex === 1 ? 0.015 : trendIndex === 2 ? -0.015 : 0;
  const today = new Date();

  const historicalData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (30 - i));
    const seasonality = 1 + 0.15 * Math.sin((i / 7) * Math.PI * 2);
    const noise = 1 + 0.1 * Math.sin(i * seed * 0.37);
    return {
      date: date.toISOString().split('T')[0],
      quantity: Math.max(1, Math.round(baseQty * seasonality * noise)),
    };
  });

  const forecast = Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() + i + 1);
    const trend = 1 + trendFactor * i;
    const seasonality = 1 + 0.15 * Math.sin(((30 + i) / 7) * Math.PI * 2);
    const noise = 1 + 0.08 * Math.sin((i + seed) * 0.53);
    const confidence = Math.round(Math.max(0.50, 0.95 - i * 0.004) * 100) / 100;
    return {
      date: date.toISOString().split('T')[0],
      predictedQuantity: Math.max(1, Math.round(baseQty * trend * seasonality * noise)),
      confidence,
    };
  });

  const trend = trendIndex === 1 ? 'increasing' : trendIndex === 2 ? 'decreasing' : 'stable';
  const accuracy = Math.round((0.82 + (seed % 15) / 100) * 1000) / 1000;

  return { itemId, itemName, sku, historicalData, forecast, accuracy, trend } as const;
}
