'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  AlertTriangle,
  FileText,
  Settings,
  Users,
  Truck,
  BarChart3,
  Activity,
  Database
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Stock Management', href: '/stock', icon: ShoppingCart },
  { name: 'Expiry Tracking', href: '/expiry', icon: AlertTriangle },
  { name: 'Billing', href: '/billing', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Vendors', href: '/vendors', icon: Truck },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Super Admin', href: '/superadmin', icon: Users },
  { name: 'Platform Data', href: '/platform-data', icon: Database },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => {
    if (user?.role === 'staff') {
      return !['Reports', 'Settings', 'Super Admin', 'Platform Data', 'Vendors'].includes(item.name);
    }
    if (user?.role === 'admin' || user?.role === 'manager') {
      return !['Super Admin', 'Platform Data'].includes(item.name);
    }
    if (user?.role === 'superadmin') {
      return ['Super Admin', 'Platform Data', 'Settings'].includes(item.name);
    }
  });

  return (
    <div className="flex flex-col w-full md:w-64 h-full bg-slate-900 text-white shadow-xl">
      <div className="flex items-center justify-center h-16 border-b border-slate-700 space-x-3">
        <div className="bg-white/10 p-1.5 rounded-xl border border-white/20 shadow-sm">
          <Activity className="w-6 h-6 text-teal-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Pharma<span className="text-teal-400">Track</span></h1>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="px-2 py-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
