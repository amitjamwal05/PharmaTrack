'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, AlertTriangle, AlertCircle, TrendingUp, FileText, Wallet, IndianRupee, ShoppingCart, PlusCircle, PackagePlus, Users, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays } from 'date-fns';

import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

import { RevenueLineChart } from '@/components/charts/RevenueLineChart';
import { TopProductsPieChart } from '@/components/charts/TopProductsPieChart';
import { CriticalStockWidget } from '@/components/widgets/CriticalStockWidget';
import { StaffLeaderboard } from '@/components/charts/StaffLeaderboard';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    expiringSoon: 0,
    expired: 0,
    currentStockValue: 0,
    todaySales: 0,
    totalProfit: 0,
    productsSoldToday: 0,
    productsAddedToday: 0,
  });

  const [dateRange, setDateRange] = useState('7days');
  const [recentBills, setRecentBills] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProductsData, setTopProductsData] = useState<any[]>([]);
  const [criticalStockData, setCriticalStockData] = useState<any[]>([]);
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
      setLoading(true);
      try {
        let startD = new Date();
        if (dateRange === '7days') startD = subDays(new Date(), 7);
        if (dateRange === 'month') startD = subDays(new Date(), 30);
        if (dateRange === 'year') startD = subDays(new Date(), 365);
        
        const startDate = format(startD, 'yyyy-MM-dd');
        const endDate = format(new Date(), 'yyyy-MM-dd');

        const [stockRes, expiryRes, salesRes, historyRes, lowStockRes] = await Promise.all([
          api.get('/reports/stock'),
          api.get('/reports/expiry'),
          api.get(`/reports/sales?startDate=${startDate}&endDate=${endDate}`),
          api.get('/stock/history').catch(() => ({ data: [] })),
          api.get('/products/low-stock')
        ]);

        let daysCount = 0;
        if (dateRange === 'today') daysCount = 1;
        if (dateRange === '7days') daysCount = 7;
        if (dateRange === 'month') daysCount = 30;
        if (dateRange === 'year') daysCount = 365;

        const dateRangeArray = Array.from({ length: daysCount }).map((_, i) => {
          const d = subDays(new Date(), i);
          return {
            dateStr: format(d, 'yyyy-MM-dd'),
            displayDate: format(d, 'MMM dd'),
            revenue: 0
          };
        }).reverse();

        const topProductsMap: Record<string, number> = {};
        const staffMap: Record<string, number> = {};

        const todayStr = format(new Date(), 'yyyy-MM-dd');
        let productsSoldToday = 0;

        salesRes.data.bills.forEach((bill: any) => {
          const billDate = format(new Date(bill.createdAt), 'yyyy-MM-dd');
          const day = dateRangeArray.find(d => d.dateStr === billDate);
          if (day) {
            day.revenue += bill.totalAmount;
          }
          
          if (billDate === todayStr) {
            productsSoldToday += bill.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
          }
          
          const staffName = bill.userId?.name || 'Unknown Staff';
          staffMap[staffName] = (staffMap[staffName] || 0) + bill.totalAmount;
          
          bill.items.forEach((item: any) => {
            topProductsMap[item.productName] = (topProductsMap[item.productName] || 0) + item.quantity;
          });
        });

        // Get recent bills
        const sortedBills = [...salesRes.data.bills].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentBills(sortedBills.slice(0, 5));

        let productsAddedToday = 0;
        historyRes.data.forEach((history: any) => {
          if (format(new Date(history.createdAt), 'yyyy-MM-dd') === todayStr && history.reason === 'restock') {
            productsAddedToday += history.quantityChange;
          }
        });

        setStats({
          totalProducts: stockRes.data.totalProducts || stockRes.data.totalUniqueProducts || 0,
          lowStock: stockRes.data.lowStockItems || lowStockRes.data.length || 0,
          expiringSoon: expiryRes.data.expiringSoon || expiryRes.data.expiringSoonCount || 0,
          expired: expiryRes.data.expired || expiryRes.data.expiredCount || 0,
          currentStockValue: stockRes.data.totalStockValue || 0,
          todaySales: salesRes.data.totalSales || 0,
          totalProfit: salesRes.data.totalProfit || 0,
          productsSoldToday,
          productsAddedToday
        });

        setSalesData(dateRangeArray.map(day => ({
          date: day.displayDate,
          revenue: day.revenue
        })));

        const topProducts = Object.entries(topProductsMap)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5); // top 5
        setTopProductsData(topProducts);

        // Sort low stock items by quantity ascending, take top 5
        const criticalStock = [...lowStockRes.data]
          .sort((a, b) => a.quantity - b.quantity)
          .slice(0, 5);
        setCriticalStockData(criticalStock);

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
  }, [dateRange]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm">Welcome back! Here's what's happening today.</p>
        </div>
        <Select value={dateRange} onValueChange={(val) => val && setDateRange(val)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {user?.role !== 'staff' && (
          <Card className="border-l-4 border-l-teal-500 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {dateRange === 'today' ? "Today's Sales" : "Total Sales"}
              </CardTitle>
              <IndianRupee className="w-4 h-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.todaySales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.productsSoldToday} products sold
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role !== 'staff' && (
          <Card className="border-l-4 border-l-green-500 animate-slide-up-fade bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-900/20" style={{ animationDelay: '150ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
                {dateRange === 'today' ? "Today's Profit" : "Total Profit"}
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                ₹{stats.totalProfit.toFixed(2)}
              </div>
              <p className="text-xs text-green-600/80 dark:text-green-400/80 mt-1">
                Net margin on sales
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role !== 'staff' && (
          <Card className="border-l-4 border-l-purple-500 animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
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
          <Card className="border-l-4 border-l-indigo-500 animate-slide-up-fade" style={{ animationDelay: '100ms' }}>
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
          <Card className="border-l-4 border-l-green-500 animate-slide-up-fade" style={{ animationDelay: '200ms' }}>
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

        <Card className="border-l-4 border-l-blue-500 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors animate-slide-up-fade" style={{ animationDelay: '300ms' }} onClick={() => router.push('/products')}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique items in inventory</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-colors animate-slide-up-fade" style={{ animationDelay: '400ms' }} onClick={() => router.push('/stock')}>
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
            <CriticalStockWidget data={criticalStockData} />
          </div>
          <div className="min-w-0">
            <StaffLeaderboard data={staffPerformanceData} />
          </div>
        </div>
      )}

    </div>
  );
}
