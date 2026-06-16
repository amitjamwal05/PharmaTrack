'use client';

import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        {/* Skeleton Sidebar */}
        <div className="hidden md:flex flex-col w-64 h-full bg-slate-900 border-r border-border p-4">
          <Skeleton className="h-8 w-3/4 bg-slate-800 mb-8 mt-2 mx-auto" />
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-slate-800 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Skeleton Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Skeleton Header */}
          <header className="flex items-center justify-between h-16 px-6 bg-card border-b border-border">
            <Skeleton className="h-8 w-8 rounded-md md:hidden" />
            <div className="flex-1" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
              <div className="flex space-x-3 items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 ml-auto" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </header>
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
               <Skeleton className="h-10 w-64 mb-6" />
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {Array.from({ length: 4 }).map((_, i) => (
                   <Skeleton key={i} className="h-32 w-full rounded-xl" />
                 ))}
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                 <Skeleton className="h-80 w-full rounded-xl" />
                 <Skeleton className="h-80 w-full rounded-xl" />
               </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
          <p className="text-sm text-muted-foreground mt-4 animate-pulse">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden print:bg-card print:h-auto print:block">
      {/* Sidebar - Hidden on mobile, visible on md+ screens */}
      <div className="hidden md:flex print:hidden">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden print:overflow-visible print:block">
        <div className="print:hidden">
          <Header />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 print:p-0 print:overflow-visible">
          <div className="max-w-7xl mx-auto print:max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
