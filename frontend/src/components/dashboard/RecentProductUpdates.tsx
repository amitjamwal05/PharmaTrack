import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import api from '@/lib/api';
import { History, UserCircle2 } from 'lucide-react';

interface ProductUpdate {
  _id: string;
  productName: string;
  category: string;
  updatedAt: string;
  createdAt: string;
  createdBy?: {
    _id: string;
    name: string;
    role: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    role: string;
  };
}

export function RecentProductUpdates() {
  const [updates, setUpdates] = useState<ProductUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await api.get('/products/recent-updates');
        setUpdates(res.data);
      } catch (error) {
        console.error('Failed to fetch product updates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUpdates();
  }, []);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <CardTitle>Product Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-40 bg-muted rounded-md w-full"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-slide-up-fade" style={{ animationDelay: '300ms' }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" />
          Product Audit Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        {updates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No products have been updated recently.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Last Updated By</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.map((product) => {
                  const isNew = new Date(product.createdAt).getTime() === new Date(product.updatedAt).getTime();
                  return (
                    <TableRow key={product._id}>
                      <TableCell className="font-medium">
                        {product.productName}
                        <div className="text-xs text-muted-foreground mt-0.5">{product.category}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCircle2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {product.createdBy ? product.createdBy.name : 'System/Unknown'}
                          </span>
                        </div>
                        {product.createdBy?.role && (
                          <Badge variant="outline" className="mt-1 text-[10px] h-4">
                            {product.createdBy.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <UserCircle2 className={`w-4 h-4 ${isNew ? 'text-green-500' : 'text-amber-500'}`} />
                          <span className="text-sm">
                            {product.updatedBy ? product.updatedBy.name : 'System/Unknown'}
                          </span>
                        </div>
                        {product.updatedBy?.role && (
                          <Badge variant="outline" className="mt-1 text-[10px] h-4">
                            {product.updatedBy.role}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(product.updatedAt), { addSuffix: true })}
                        <div className="mt-1 flex justify-end">
                          {isNew ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 border-0">Created</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100 border-0">Updated</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
