'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Database } from 'lucide-react';
import { PaymentHistoryTable } from '@/components/superadmin/PaymentHistoryTable';
import { GlobalAnnouncements } from '@/components/superadmin/GlobalAnnouncements';

export default function PlatformDataPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/superadmin/payments');
      setPayments(res.data);
    } catch (error) {
      console.error('Error fetching payments', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Shield className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <Database className="mr-3 w-8 h-8 text-teal-600" />
            Platform Data
          </h1>
          <p className="text-muted-foreground mt-1">Manage global announcements and view platform payment logs.</p>
        </div>
      </div>

      <div className="space-y-8">
        <PaymentHistoryTable 
          payments={payments}
          loading={loading}
        />

        <GlobalAnnouncements />
      </div>
    </div>
  );
}
