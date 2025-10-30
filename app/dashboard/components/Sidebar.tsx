import React from 'react';
import Link from 'next/link';
import { Home, Bot, Settings, BarChart3, AlertTriangle, Wrench, Package, Truck } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/robots', label: 'Robots', icon: Bot },
    { href: '/equipment', label: 'Equipment', icon: Package },
    { href: '/maintenance', label: 'Maintenance', icon: Wrench },
    { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="bg-white border-r border-gray-200 p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
