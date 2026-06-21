'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Building2, Store, Users, Server, Activity, Store as StoreIcon, Banknote } from 'lucide-react';
import { toast } from 'sonner';

import { StoreListTable } from '@/components/superadmin/StoreListTable';
import { ResetAdminPasswordModal } from '@/components/superadmin/ResetAdminPasswordModal';
import { EditStoreDetailsModal } from '@/components/superadmin/EditStoreDetailsModal';

import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#0d9488', '#8b5cf6', '#f97316', '#3b82f6', '#ef4444'];

export default function SuperAdminPage() {
  const { user } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const totalRevenue = payments.reduce((acc, curr) => curr.status === 'success' ? acc + curr.amount : acc, 0);
  const revenueByPlan = payments.reduce((acc, curr) => {
    if (curr.status === 'success') {
      const plan = curr.planId;
      acc[plan] = (acc[plan] || 0) + curr.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const revenuePieData = Object.keys(revenueByPlan).map(key => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: revenueByPlan[key]
  }));

  const [planModal, setPlanModal] = useState({ isOpen: false, storeId: '', storeName: '', newPlan: '' });
  const [resetModal, setResetModal] = useState({ isOpen: false, storeId: '', adminName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [editModal, setEditModal] = useState({ 
    isOpen: false, 
    storeDetails: { storeId: '', storeName: '', adminName: '', phone: '' } 
  });

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchStoresAndStats();
    }
  }, [user]);

  const fetchStoresAndStats = async () => {
    try {
      const [storesRes, statsRes, paymentsRes] = await Promise.all([
        api.get('/superadmin/stores'),
        api.get('/superadmin/dashboard-stats'),
        api.get('/superadmin/payments')
      ]);
      setStores(storesRes.data);
      setStats(statsRes.data);
      setPayments(paymentsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStore = async (id: string, storeName: string) => {
    const isConfirmed = window.confirm(
      `WARNING: This will permanently delete the store "${storeName}", including ALL its products, staff, and billing history.\n\nThis cannot be undone.\n\nAre you absolutely sure you want to proceed?`
    );
    if (!isConfirmed) return;

    try {
      await api.delete(`/superadmin/stores/${id}`);
      toast.success(`Store "${storeName}" deleted permanently.`);
      fetchStoresAndStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete store');
    }
  };

  const confirmUpdatePlan = async () => {
    try {
      await api.put(`/superadmin/stores/${planModal.storeId}/status`, { status: planModal.newPlan });
      toast.success(`Store plan updated to ${planModal.newPlan.toUpperCase()}`);
      setPlanModal({ isOpen: false, storeId: '', storeName: '', newPlan: '' });
      fetchStoresAndStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update plan');
    }
  };

  const openPlanModal = (storeId: string, storeName: string, newPlan: string) => {
    setPlanModal({ isOpen: true, storeId, storeName, newPlan });
  };

  const openResetModal = (id: string, name: string) => {
    setResetModal({ isOpen: true, storeId: id, adminName: name });
    setNewPassword('');
    setShowPassword(false);
  };

  const openEditModal = (store: any) => {
    setEditModal({
      isOpen: true,
      storeDetails: {
        storeId: store._id,
        storeName: store.name || '',
        adminName: store.adminName || '',
        phone: store.phone || ''
      }
    });
  };

  const handleEditSubmit = async (storeId: string, data: any) => {
    try {
      await api.put(`/superadmin/stores/${storeId}`, data);
      toast.success('Store details updated successfully');
      setEditModal(prev => ({ ...prev, isOpen: false }));
      fetchStoresAndStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update store details');
    }
  };

  const submitResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await api.put(`/superadmin/stores/${resetModal.storeId}/reset-password`, { password: newPassword });
      toast.success(`Admin password for ${resetModal.adminName} has been reset`);
      setResetModal({ isOpen: false, storeId: '', adminName: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
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
            <Building2 className="mr-3 w-8 h-8 text-teal-600" />
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage global platform metrics, pharmacies, and subscriptions.</p>
        </div>
      </div>

      <ResetAdminPasswordModal 
        isOpen={resetModal.isOpen}
        onClose={() => setResetModal({ isOpen: false, storeId: '', adminName: '' })}
        adminName={resetModal.adminName}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSubmit={submitResetPassword}
      />

      <EditStoreDetailsModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal(prev => ({ ...prev, isOpen: false }))}
        storeDetails={editModal.storeDetails}
        onSubmit={handleEditSubmit}
      />

      {planModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card w-full max-w-md p-6 rounded-xl shadow-lg border">
            <h3 className="text-lg font-bold mb-4">Confirm Plan Change</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to manually change the subscription plan for <strong>{planModal.storeName}</strong> to <strong className="uppercase">{planModal.newPlan}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setPlanModal(prev => ({ ...prev, isOpen: false }))}>Cancel</Button>
              <Button onClick={confirmUpdatePlan} className="bg-teal-600 hover:bg-teal-700">Confirm Update</Button>
            </div>
          </div>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-teal-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Pharmacies</CardTitle>
            <Store className="w-4 h-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stores.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active tenants on platform</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Admins and staff members</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Platform Activity</CardTitle>
            <Activity className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.platformActivity?.reduce((acc: number, curr: any) => acc + curr.bills, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total bills last 7 days</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Banknote className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">From all active subscriptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-6">
          <Card className="overflow-hidden shadow-md border-t-4 border-t-teal-500">
          <CardHeader>
            <CardTitle>Global Platform Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.platformActivity ? (
               <div className="flex items-center justify-center h-80 bg-muted rounded border border-dashed border-border"><p>Loading data...</p></div>
            ) : (
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.platformActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ stroke: 'var(--color-muted)', strokeWidth: 2, fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                      labelStyle={{ color: 'var(--color-muted-foreground)' }}
                    />
                    <Area type="monotone" dataKey="bills" name="Bills Generated" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-md border-t-4 border-t-orange-500">
            <CardHeader>
              <CardTitle>Recent Signups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!stats?.recentSignups ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : stats.recentSignups.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent signups.</p>
                ) : (
                  stats.recentSignups.map((store: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-3 border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-full shrink-0">
                        <StoreIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{store.name}</p>
                        <p className="text-xs text-muted-foreground">{new Date(store.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-xs font-bold px-2 py-1 bg-muted rounded text-foreground uppercase">
                        {store.subscriptionPlan || 'Free'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-t-4 border-t-red-500 bg-red-50/30 dark:bg-red-950/20">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">⚠️ Churn Risk (Inactive 7+ Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!stats?.churnRiskStores ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : stats.churnRiskStores.length === 0 ? (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">All stores are active! 🎉</p>
                ) : (
                  stats.churnRiskStores.map((store: any, idx: number) => (
                    <div key={idx} className="flex items-center space-x-3 border-b border-red-200 dark:border-red-900 pb-3 last:border-0 last:pb-0">
                      <div className="p-2 bg-red-100 dark:bg-red-900/60 rounded-full shrink-0">
                        <StoreIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-red-900 dark:text-red-200">{store.name}</p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80">No bills in 7 days</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden shadow-md border-t-4 border-t-purple-500">
            <CardHeader>
              <CardTitle>Subscription Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.planDistribution ? (
                <div className="flex items-center justify-center h-48 bg-muted rounded border border-dashed"><p>Loading...</p></div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.planDistribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.planDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-md border-t-4 border-t-green-500">
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {revenuePieData.length === 0 ? (
                <div className="flex items-center justify-center h-48 bg-muted rounded border border-dashed"><p className="text-sm text-muted-foreground">No revenue data</p></div>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenuePieData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {revenuePieData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                        formatter={(value) => `₹${value}`}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <StoreListTable 
        stores={stores}
        loading={loading}
        onOpenPlanModal={openPlanModal}
        onOpenResetModal={openResetModal}
        onDeleteStore={handleDeleteStore}
        onOpenEditModal={openEditModal}
      />
    </div>
  );
}
