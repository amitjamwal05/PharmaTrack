'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, User, Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import Sidebar from '@/components/dashboard/Sidebar';
import AnnouncementBanners from '@/components/dashboard/AnnouncementBanners';
import NotificationBell from '@/components/dashboard/NotificationBell';
import api from '@/lib/api';

export default function Header() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user) {
      Promise.all([
        api.get('/announcements/active').catch(() => ({ data: [] })),
        api.get('/products/expiring').catch(() => ({ data: [] })),
        api.get('/products/low-stock').catch(() => ({ data: [] }))
      ]).then(([annRes, expRes, stockRes]) => {
        const sysAnns = annRes.data.map((a: any) => ({ ...a, category: 'system' }));
        
        const expAnns = expRes.data.map((p: any) => ({
          _id: `exp_${p._id}`,
          category: 'expiry',
          title: `Expiring Soon: ${p.productName}`,
          message: `Batch ${p.batchNumber || 'N/A'} expires on ${new Date(p.expiryDate).toLocaleDateString()}.`,
          productId: p._id,
          productName: p.productName
        }));

        const stockAnns = stockRes.data.map((p: any) => ({
          _id: `stock_${p._id}`,
          category: 'low_stock',
          title: `Low Stock: ${p.productName}`,
          message: `Only ${p.quantity} left in stock (Reorder level: ${p.reorderLevel || 0}).`,
          productId: p._id,
          productName: p.productName
        }));

        setAnnouncements([...sysAnns, ...expAnns, ...stockAnns]);
      }).catch(err => console.error('Failed to load notifications', err));
    }
  }, [user]);

  return (
    <div className="flex flex-col w-full">
      <AnnouncementBanners announcements={announcements.filter(a => a.category === 'system')} />
      
      <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border">
        <div className="flex items-center md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="p-2 -ml-2 text-muted-foreground hover:text-foreground">
              <Menu className="w-6 h-6" />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[260px] max-w-[260px] border-r-0 bg-slate-900" showCloseButton={false}>
               <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
               <Sidebar />
               
               <div className="absolute top-4 right-4">
                 <button 
                   onClick={() => setIsOpen(false)}
                   className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
                   title="Close sidebar"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="hidden md:flex items-center">
          {/* Desktop left empty space or breadcrumbs could go here */}
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <NotificationBell announcements={announcements} />
          
          <Link href="/settings" className="relative flex items-center space-x-3 border-l border-border pl-4 cursor-pointer hover:opacity-80 transition-opacity group">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium text-foreground group-hover:text-teal-600 transition-colors">{user?.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{user?.role}</span>
            </div>
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
              <User className="w-5 h-5" />
            </div>
          </Link>
          
          <button
            onClick={logout}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors ml-4 border-l border-border pl-4"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
    </div>
  );
}
