'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, AlertTriangle, AlertCircle, TrendingUp, FileText, Wallet, IndianRupee, ShoppingCart, PlusCircle, PackagePlus, Users, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays } from 'date-fns';

import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

import { RevenueLineChart } from '@/components/charts/RevenueLineChart';
import { TopProductsPieChart } from '@/components/charts/TopProductsPieChart';
import { PaymentMethodPieChart } from '@/components/charts/PaymentMethodPieChart';
import { StaffLeaderboard } from '@/components/charts/StaffLeaderboard';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    expiringSoon: 0,
    expired: 0,
    currentStockValue: 0,
    todaySales: 0,
    productsSoldToday: 0,
    productsAddedToday: 0,
  });

  const [recentBills, setRecentBills] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [staffPerformanceData, setStaffPerformanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === 'superadmin') {
      router.replace('/superadmin');
    }
  }, [user, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const endDate = format(new Date(), 'yyyy-MM-dd');
        const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd'); // Last 7 days

        const [stockRes, expiryRes, billsRes, salesRes, historyRes] = await Promise.all([
          api.get('/reports/stock'),
          api.get('/reports/expiry'),
          api.get('/bills'),
          api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),
          api.get('/stock/history').catch(() => ({ data: [] }))
        ]);

        const lowStockRes = await api.get('/products/low-stock');

        // Get top 5 recent bills
        const sortedBills = [...billsRes.data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentBills(sortedBills.slice(0, 5));
        
        // Format sales data for Recharts (last 7 days)
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = subDays(new Date(), i);
          return {
            dateStr: format(d, 'yyyy-MM-dd'),
            displayDate: format(d, 'MMM dd'),
            revenue: 0
          };
        }).reverse(); // oldest to newest

        const todayStr = format(new Date(), 'yyyy-MM-dd');
        let productsSoldToday = 0;
        
        const topProductsMap: Record<string, number> = {};
        const paymentMap: Record<string, number> = {};
        const staffMap: Record<string, number> = {};

        billsRes.data.forEach((bill: any) => {
          const billDate = format(new Date(bill.createdAt), 'yyyy-MM-dd');
          const day = last7Days.find(d => d.dateStr === billDate);
          if (day) {
            day.revenue += bill.totalAmount;
          }
          if (billDate === todayStr) {
            productsSoldToday += bill.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
            
            const method = bill.paymentMethod || 'cash';
            paymentMap[method] = (paymentMap[method] || 0) + bill.totalAmount;
            
            const staffName = bill.userId?.name || 'Unknown Staff';
            staffMap[staffName] = (staffMap[staffName] || 0) + bill.totalAmount;
          }
          
          // Accumulate for top products pie chart
          bill.items.forEach((item: any) => {
            topProductsMap[item.productName] = (topProductsMap[item.productName] || 0) + item.quantity;
          });
        });

        const todaySales = last7Days[last7Days.length - 1].revenue;

        let productsAddedToday = 0;
        historyRes.data.forEach((history: any) => {
          if (format(new Date(history.createdAt), 'yyyy-MM-dd') === todayStr && history.quantityChange > 0 && history.reason !== 'sale') {
             productsAddedToday += history.quantityChange;
          }
        });

        setStats({
          totalProducts: stockRes.data.totalUniqueProducts || 0,
          lowStock: lowStockRes.data.length || 0,
          expiringSoon: expiryRes.data.expiringSoonCount || 0,
          expired: expiryRes.data.expiredCount || 0,
          currentStockValue: stockRes.data.totalStockValue || 0,
          todaySales: todaySales || 0,
          productsSoldToday,
          productsAddedToday
        });

        setSalesData(last7Days.map(day => ({
          date: day.displayDate,
          revenue: day.revenue
        })));

        const topProducts = Object.entries(topProductsMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // top 5
        setTopProductsData(topProducts);

        const paymentData = Object.entries(paymentMap).map(([name, value]) => ({ 
          name: name.charAt(0).toUpperCase() + name.slice(1), 
          value 
        }));
        setPaymentMethodData(paymentData);

        const staffData = Object.entries(staffMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        setStaffPerformanceData(staffData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {user?.role !== 'staff' && (
          <Card className="border-l-4 border-l-teal-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Sales</CardTitle>
              <IndianRupee className="w-4 h-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.todaySales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total revenue today</p>
            </CardContent>
          </Card>
        )}

        {user?.role !== 'staff' && (
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Stock Value</CardTitle>
              <Wallet className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.currentStockValue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total inventory value</p>
            </CardContent>
          </Card>
        )}

        {user?.role === 'staff' && (
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Products Sold Today</CardTitle>
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productsSoldToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Units sold across bills</p>
            </CardContent>
          </Card>
        )}

        {user?.role === 'staff' && (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Products Added Today</CardTitle>
              <PlusCircle className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.productsAddedToday}</div>
              <p className="text-xs text-muted-foreground mt-1">Units added to stock</p>
            </CardContent>
          </Card>
        )}

        <Card className="border-l-4 border-l-blue-500 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors" onClick={() => router.push('/products')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique items in inventory</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors" onClick={() => router.push('/stock')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
            <TrendingUp className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground mt-1">Items below reorder level</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition-colors" onClick={() => router.push('/expiry')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" onClick={() => router.push('/expiry')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs disposal/return</p>
          </CardContent>
        </Card>
      </div>

      <div className={`grid gap-6 ${user?.role === 'staff' ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}>
        
        {user?.role !== 'staff' && (
          <div className="md:col-span-2 space-y-6 min-w-0">
            <RevenueLineChart data={salesData} title="Sales Revenue (Last 7 Days)" />
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors border-teal-100 dark:border-teal-900/50" onClick={() => router.push('/billing')}>
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-full">
                    <Receipt className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <span className="font-medium text-sm text-center">New Bill</span>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-purple-100 dark:border-purple-900/50" onClick={() => router.push('/stock')}>
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                    <PackagePlus className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="font-medium text-sm text-center">Add Stock</span>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors border-orange-100 dark:border-orange-900/50" onClick={() => router.push('/vendors')}>
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="font-medium text-sm text-center">Manage Vendors</span>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-blue-100 dark:border-blue-900/50" onClick={() => router.push('/reports')}>
                <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="font-medium text-sm text-center">View Reports</span>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        <div className="space-y-6 flex flex-col min-w-0">
          {user?.role !== 'staff' && (
             <TopProductsPieChart data={topProductsData} title="Top Selling Products" />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                {recentBills.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity found.</p>
                ) : (
                  recentBills.slice(0, 3).map((bill, index) => (
                    <div key={index} className="flex items-center space-x-4 border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-full">
                        <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New Bill Created: {bill.billNumber}</p>
                        <p className="text-xs text-muted-foreground">
                          {bill.items.length} items sold to {bill.customerName || 'Cash Walk-in'}
                        </p>
                      </div>
                      {user?.role !== 'staff' && (
                        <div className="text-sm font-bold text-teal-600 dark:text-teal-400">
                          +₹{bill.totalAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Widgets Section */}
      {user?.role !== 'staff' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="min-w-0">
            <PaymentMethodPieChart data={paymentMethodData} />
          </div>
          <div className="min-w-0">
            <StaffLeaderboard data={staffPerformanceData} />
          </div>
        </div>
      )}

    </div>
  );
}
