import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Trash2, Plus, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ResetPasswordModal } from './ResetPasswordModal';

export function StaffManagement({ user }: { user: any }) {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewStaffPassword, setShowNewStaffPassword] = useState(false);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '', role: 'staff' });
  
  const [resetModal, setResetModal] = useState({ isOpen: false, staffId: '', staffName: '' });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin' || user?.role === 'manager') {
      fetchStaff();
    }
  }, [user]);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/staff');
      setStaff(res.data);
    } catch (error) {
      console.error('Error fetching staff', error);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/staff', newStaff);
      toast.success('Staff member added successfully');
      setNewStaff({ name: '', email: '', password: '', role: 'staff' });
      fetchStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await api.delete(`/auth/staff/${id}`);
      toast.success('Staff member removed');
      fetchStaff();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove staff');
    }
  };

  const openResetModal = (id: string, name: string) => {
    setResetModal({ isOpen: true, staffId: id, staffName: name });
    setNewPassword('');
    setShowPassword(false);
  };

  const submitResetPassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      await api.put(`/auth/staff/${resetModal.staffId}/reset-password`, { password: newPassword });
      toast.success(`Password for ${resetModal.staffName} has been reset`);
      setResetModal({ isOpen: false, staffId: '', staffName: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'manager') return null;

  return (
    <>
      <ResetPasswordModal 
        isOpen={resetModal.isOpen}
        onClose={() => setResetModal({ isOpen: false, staffId: '', staffName: '' })}
        staffName={resetModal.staffName}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onSubmit={submitResetPassword}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <CardTitle>Staff Management</CardTitle>
          </div>
          <CardDescription>Add and remove cashiers or managers for your store.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAddStaff} className="grid md:grid-cols-5 gap-4 items-end bg-muted/50 p-4 rounded-lg border border-border">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input required value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input required type="email" value={newStaff.email} onChange={(e) => setNewStaff({...newStaff, email: e.target.value})} placeholder="john@example.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input 
                  required 
                  type={showNewStaffPassword ? "text" : "password"} 
                  value={newStaff.password} 
                  onChange={(e) => setNewStaff({...newStaff, password: e.target.value})} 
                  placeholder="••••••" 
                  className="pr-10"
                />
                <button 
                  type="button" 
                  onClick={() => setShowNewStaffPassword(!showNewStaffPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewStaffPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newStaff.role}
                onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
              >
                <option value="staff">Cashier (Staff)</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" /> Add
            </Button>
          </form>

          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">No staff members found.</TableCell>
                  </TableRow>
                ) : (
                  staff.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-xs font-semibold uppercase">
                          {s.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => openResetModal(s._id, s.name)}
                          disabled={s._id === user?._id}
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4 text-amber-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteStaff(s._id)}
                          disabled={s._id === user?._id}
                          title="Delete Staff"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
