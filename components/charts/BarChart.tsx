'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: any[];
  bars: Array<{
    dataKey: string;
    fill: string;
    name?: string;
  }>;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

export default function CustomBarChart({ 
  data, 
  bars, 
  height = 300, 
  showGrid = true, 
  showLegend = true 
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" />}
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        {showLegend && <Legend />}
        {bars.map((bar, index) => (
          <Bar
            key={index}
            dataKey={bar.dataKey}
            fill={bar.fill}
            name={bar.name || bar.dataKey}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}