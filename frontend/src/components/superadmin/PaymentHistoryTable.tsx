import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface PaymentHistoryTableProps {
  payments: any[];
  loading: boolean;
}

export function PaymentHistoryTable({ payments, loading }: PaymentHistoryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment History</CardTitle>
        <CardDescription>A log of all subscription payments made by stores.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[800px]">
            <TableHeader>
              <TableRow>
                <TableHead>Store Details</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No payments found.</TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell className="font-medium">
                      {payment.storeId?.name || 'Unknown Store'}
                      <div className="text-xs text-muted-foreground mt-1">{payment.storeId?.adminEmail || 'No email'}</div>
                    </TableCell>
                    <TableCell className="capitalize">{payment.planId}</TableCell>
                    <TableCell className="text-right font-semibold text-teal-600 dark:text-teal-400">₹{payment.amount}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{payment.razorpayPaymentId}</TableCell>
                    <TableCell>{format(new Date(payment.createdAt), 'MMM dd, yyyy HH:mm')}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        payment.status === 'success' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {payment.status}
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
