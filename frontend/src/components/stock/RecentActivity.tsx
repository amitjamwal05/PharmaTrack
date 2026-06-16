import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format } from 'date-fns';

export function RecentActivity({ history }: { history: any[] }) {
  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <CardTitle>Recent Activity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-6">Product</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="text-right">Change</TableHead>
                <TableHead className="text-right pr-6">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    No recent stock activities found.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((h, i) => {
                  const isIncrease = h.quantityChange > 0;
                  const actionName = h.reason.charAt(0).toUpperCase() + h.reason.slice(1);
                  
                  return (
                    <TableRow key={i}>
                      <TableCell className="pl-6">
                        <div className="font-medium">{h.productId?.productName || 'Unknown Product'}</div>
                        <div className="text-xs text-muted-foreground">Batch: {h.productId?.batchNumber || 'N/A'}</div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-muted-foreground">
                          {actionName}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`inline-flex items-center text-sm font-bold ${isIncrease ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {isIncrease ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                          {Math.abs(h.quantityChange)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 text-sm text-muted-foreground">
                        {format(new Date(h.createdAt), 'MMM dd, HH:mm')}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
