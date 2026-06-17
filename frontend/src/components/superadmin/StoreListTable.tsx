import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Key, Trash2, Edit3 } from 'lucide-react';

interface StoreListTableProps {
  stores: any[];
  loading: boolean;
  onUpdatePlan: (id: string, plan: string) => void;
  onOpenResetModal: (id: string, name: string) => void;
  onDeleteStore: (id: string, name: string) => void;
  onOpenEditModal: (store: any) => void;
}

export function StoreListTable({ stores, loading, onUpdatePlan, onOpenResetModal, onDeleteStore, onOpenEditModal }: StoreListTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registered Stores</CardTitle>
        <CardDescription>A list of all tenants currently using the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Admin Name</TableHead>
                <TableHead>Contact / Email</TableHead>
                <TableHead className="text-center">Total Staff</TableHead>
                <TableHead className="text-center">Subscription</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
                </TableRow>
              ) : stores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No stores registered yet.</TableCell>
                </TableRow>
              ) : (
                stores.map((store) => (
                  <TableRow key={store._id}>
                    <TableCell className="font-medium">
                      {store.name}
                      <div className="text-xs text-muted-foreground mt-1">ID: {store._id}</div>
                    </TableCell>
                    <TableCell>{store.adminName}</TableCell>
                    <TableCell>
                      <div>{store.phone || 'No phone'}</div>
                      <div className="text-xs text-muted-foreground">{store.adminEmail}</div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{store.userCount}</TableCell>
                    <TableCell className="text-center">
                      <select 
                        className="px-2 py-1 bg-teal-50 dark:bg-teal-900 border border-teal-200 dark:border-teal-700 text-teal-800 dark:text-teal-300 rounded-md text-xs font-semibold uppercase cursor-pointer outline-none focus:ring-2 focus:ring-teal-500"
                        value={store.subscriptionPlan || 'free'}
                        onChange={(e) => onUpdatePlan(store._id, e.target.value)}
                        title="Change Plan"
                      >
                        <option value="free">FREE (Pending)</option>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annually">Annually</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onOpenEditModal(store)}
                        title="Edit Store Details"
                      >
                        <Edit3 className="w-4 h-4 text-blue-500 hover:text-blue-700" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onOpenResetModal(store._id, store.adminName)}
                        title="Reset Admin Password"
                      >
                        <Key className="w-4 h-4 text-amber-500 hover:text-amber-700" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => onDeleteStore(store._id, store.name)}
                        title="Delete Store"
                      >
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
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
  );
}
