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
  Truck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Stock Management', href: '/stock', icon: ShoppingCart },
  { name: 'Expiry Tracking', href: '/expiry', icon: AlertTriangle },
  { name: 'Billing', href: '/billing', icon: FileText },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Vendors', href: '/vendors', icon: Truck },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Super Admin', href: '/superadmin', icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter(item => {
    if (user?.role === 'staff') {
      return !['Reports', 'Settings', 'Super Admin', 'Vendors'].includes(item.name);
    }
    if (user?.role === 'admin' || user?.role === 'manager') {
      return item.name !== 'Super Admin';
    }
    if (user?.role === 'superadmin') {
      return ['Super Admin', 'Settings'].includes(item.name);
    }
  });

  return (
    <div className="flex flex-col w-full md:w-64 h-full bg-slate-900 text-white shadow-xl">
      <div className="flex items-center justify-center h-16 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-teal-400">PharmaTrack</h1>
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
