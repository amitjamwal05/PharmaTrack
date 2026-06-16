import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { User, Store } from 'lucide-react';

export function UserProfile({ user }: { user: any }) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <CardTitle>User Profile</CardTitle>
          </div>
          <CardDescription>Your personal account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input value={user?.name || ''} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input value={user?.email || ''} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Input value={(user?.role || '').toUpperCase()} readOnly className="bg-muted font-semibold" />
          </div>
        </CardContent>
      </Card>

      {user?.role !== 'superadmin' && (
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Store className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <CardTitle>Store Information</CardTitle>
            </div>
            <CardDescription>Details about your pharmacy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Store Name</label>
              <Input value={user?.storeName || user?.storeId?.name || ''} readOnly className="bg-muted font-semibold" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Store ID</label>
              <Input value={user?.storeId?._id || user?.storeId || ''} readOnly className="bg-muted text-xs font-mono" />
            </div>
            <div className="p-4 bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800 rounded-lg mt-6">
              <h3 className="font-semibold text-teal-800 dark:text-teal-300 mb-2">Automated Alerts</h3>
              <p className="text-sm text-teal-700 dark:text-teal-400 mb-4">
                Important system notifications will be sent to your email.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
