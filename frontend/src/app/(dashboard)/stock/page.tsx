'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { UpdateInventoryForm } from '@/components/stock/UpdateInventoryForm';
import { LowStockAlerts } from '@/components/stock/LowStockAlerts';
import { RecentActivity } from '@/components/stock/RecentActivity';

export default function StockManagementPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [productsRes, historyRes] = await Promise.all([
        api.get('/products'),
        api.get('/stock/history')
      ]);
      setProducts(productsRes.data);
      setHistory(historyRes.data.slice(0, 8)); // Top 8 recent activities
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock Management</h1>

      <div className="grid lg:grid-cols-5 gap-6">
        
        {/* Left Column: Update Inventory Form */}
        <div className="lg:col-span-2">
          <UpdateInventoryForm products={products} onSuccess={fetchData} />
        </div>

        {/* Right Column: Widgets */}
        <div className="lg:col-span-3 space-y-6 min-w-0">
          <LowStockAlerts products={products} />
          <RecentActivity history={history} />
        </div>
      </div>
    </div>
  );
}
