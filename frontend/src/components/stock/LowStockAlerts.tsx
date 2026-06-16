import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle } from 'lucide-react';

export function LowStockAlerts({ products }: { products: any[] }) {
  const lowStockProducts = products.filter(p => p.quantity <= p.reorderLevel).slice(0, 5);

  return (
    <Card>
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <CardTitle>Low Stock Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-6">Product</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead className="text-right pr-6">Current Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStockProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    All products are well stocked!
                  </TableCell>
                </TableRow>
              ) : (
                lowStockProducts.map(p => (
                  <TableRow key={p._id}>
                    <TableCell className="pl-6 font-medium">{p.productName}</TableCell>
                    <TableCell className="text-muted-foreground">{p.batchNumber}</TableCell>
                    <TableCell className="text-right pr-6">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        {p.quantity} left
                      </span>
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
