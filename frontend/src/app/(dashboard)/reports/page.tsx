'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText, TrendingUp, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

import { RevenueLineChart } from '@/components/charts/RevenueLineChart';
import { ProfitMarginBarChart } from '@/components/charts/ProfitMarginBarChart';
import { TopProductsPieChart } from '@/components/charts/TopProductsPieChart';

export default function ReportsPage() {
  const [salesReport, setSalesReport] = useState<any>(null);
  const [stockValue, setStockValue] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [salesRes, stockRes] = await Promise.all([
        api.get(`/reports/sales?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        api.get('/reports/stock')
      ]);
      
      const bills = salesRes.data.bills || [];
      const dailySalesMap: Record<string, any> = {};
      const topProductsMap: Record<string, number> = {};
      
      bills.forEach((bill: any) => {
        const date = format(new Date(bill.createdAt), 'yyyy-MM-dd');
        if (!dailySalesMap[date]) {
          dailySalesMap[date] = { _id: date, bills: 0, revenue: 0, profit: 0 };
        }
        dailySalesMap[date].bills += 1;
        dailySalesMap[date].revenue += bill.totalAmount;
        
        let billCost = 0;
        let billRevNoGst = 0;
        bill.items?.forEach((item: any) => {
          billCost += (item.purchasePrice || 0) * item.quantity;
          billRevNoGst += item.sellingPrice * item.quantity;
          
          topProductsMap[item.productName] = (topProductsMap[item.productName] || 0) + item.quantity;
        });
        const billProfit = billRevNoGst - billCost - (bill.discountAmount || 0);
        dailySalesMap[date].profit += billProfit;
      });

      // Sort oldest to newest for charts
      const dailySales = Object.values(dailySalesMap).sort((a: any, b: any) => new Date(a._id).getTime() - new Date(b._id).getTime());

      const chartData = dailySales.map((day: any) => ({
        date: format(new Date(day._id), 'MMM dd'),
        revenue: day.revenue,
        profit: day.profit
      }));

      const topProductsData = Object.entries(topProductsMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      setSalesReport({
        totalRevenue: salesRes.data.totalSales,
        totalBills: salesRes.data.totalBills,
        totalProfit: salesRes.data.totalProfit || 0,
        dailySales, // sorted oldest to newest
        chartData,
        topProductsData
      });

      setStockValue({ totalInventoryValue: stockRes.data.totalStockValue });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports & Analytics</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales Report Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="space-y-2 w-full md:w-auto">
              <label className="text-sm font-medium">Start Date</label>
              <Input 
                type="date" 
                value={dateRange.startDate} 
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })} 
                className="w-full"
              />
            </div>
            <div className="space-y-2 w-full md:w-auto">
              <label className="text-sm font-medium">End Date</label>
              <Input 
                type="date" 
                value={dateRange.endDate} 
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })} 
                className="w-full"
              />
            </div>
            <Button onClick={fetchReports} disabled={loading} className="bg-teal-600 hover:bg-teal-700 w-full md:w-auto">
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{salesReport?.totalRevenue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">For selected period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Profit</CardTitle>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600 dark:text-teal-400">
              ₹{salesReport?.totalProfit?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Gross profit after costs</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Invoices</CardTitle>
            <FileText className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {salesReport?.totalBills || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">For selected period</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Stock Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              ₹{stockValue?.totalInventoryValue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total inventory at cost</p>
          </CardContent>
        </Card>
      </div>

      {salesReport && salesReport.chartData && salesReport.chartData.length > 0 && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="min-w-0">
              <RevenueLineChart data={salesReport.chartData} title="Revenue Trend" />
            </div>
            <div className="min-w-0">
              <ProfitMarginBarChart data={salesReport.chartData} title="Revenue vs Gross Profit" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 min-w-0">
              <TopProductsPieChart data={salesReport.topProductsData} title="Top Products (By Volume)" />
            </div>

            <div className="md:col-span-2 min-w-0">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Daily Sales Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border border-border overflow-x-auto overflow-y-auto max-h-[300px]">
                    <table className="w-full text-sm text-left min-w-[500px]">
                      <thead className="bg-muted border-b border-border sticky top-0">
                        <tr>
                          <th className="px-4 py-3 font-medium text-foreground">Date</th>
                          <th className="px-4 py-3 font-medium text-foreground text-right">Bills Generated</th>
                          <th className="px-4 py-3 font-medium text-foreground text-right">Revenue (₹)</th>
                          <th className="px-4 py-3 font-medium text-foreground text-right">Profit (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {[...salesReport.dailySales].reverse().map((day: any) => (
                          <tr key={day._id}>
                            <td className="px-4 py-3">{day._id}</td>
                            <td className="px-4 py-3 text-right">{day.bills}</td>
                            <td className="px-4 py-3 text-right font-medium">₹{day.revenue.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-teal-600 dark:text-teal-400">₹{(day.profit || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
