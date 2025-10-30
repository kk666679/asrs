import React from 'react';
import { Bot } from 'lucide-react';

interface HeaderProps {
  activeCount: number;
}

export default function Header({ activeCount }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 lg:col-span-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-sky-600" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">AMR Fleet Control</h1>
            <p className="text-sm text-gray-600">{activeCount} AMRs Active</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Dashboard</p>
          <p className="text-xs text-gray-500">Real-time Monitoring</p>
        </div>
      </div>
    </header>
  );
}
