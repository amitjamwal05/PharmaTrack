import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, ArrowLeft, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useEffect, useState } from 'react';

interface ReceiptProps {
  completedBill: any;
  user: any;
  onNewBill: () => void;
}

export default function Receipt({ completedBill, user, onNewBill }: ReceiptProps) {
  const [receiptUrl, setReceiptUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && completedBill) {
      setReceiptUrl(`${window.location.origin}/receipt/${completedBill._id}`);
    }
  }, [completedBill]);

  if (!completedBill) return null;

  const handleWhatsAppShare = () => {
    const storeName = user?.storeName || 'PharmaTrack';
    const message = `Hello${completedBill.customerName ? ` ${completedBill.customerName}` : ''}! Here is your digital receipt from ${storeName} for amount Rs. ${completedBill.totalAmount.toFixed(2)}.\n\nView Receipt: ${receiptUrl}`;
    
    // Create deep link
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center print:hidden mb-6 gap-4">
        <Button variant="outline" onClick={onNewBill} className="w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4 mr-2" /> New Bill
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {receiptUrl && (
            <Button onClick={handleWhatsAppShare} className="bg-green-600 hover:bg-green-700 w-full sm:w-auto text-white">
              <Share2 className="w-4 h-4 mr-2" /> Share via WhatsApp
            </Button>
          )}
          <Button onClick={() => window.print()} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2">
          <Card className="p-8 print:shadow-none print:border-none rounded-none w-full" id="receipt">
         <div className="text-center border-b pb-4 mb-6 border-dashed border-gray-300">
           <h2 className="text-3xl font-bold uppercase tracking-widest text-foreground">
             {user?.storeName || 'PHARMATRACK'}
           </h2>
           <p className="text-sm text-muted-foreground mt-1">Retail Invoice / Cash Memo</p>
         </div>
         
         <div className="flex justify-between text-sm mb-6 pb-6 border-b border-dashed border-gray-300">
           <div className="space-y-1">
             <p><span className="text-muted-foreground">Bill No:</span> <span className="font-medium">{completedBill.billNumber}</span></p>
             <p><span className="text-muted-foreground">Date:</span> <span className="font-medium">{new Date(completedBill.createdAt).toLocaleString()}</span></p>
           </div>
           <div className="text-right space-y-1">
             <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{completedBill.customerName || 'Cash Walk-in'}</span></p>
             <p><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{completedBill.customerPhone || 'N/A'}</span></p>
           </div>
         </div>

         <table className="w-full text-sm text-left mb-6">
           <thead className="border-b border-gray-300">
             <tr>
               <th className="py-2 font-semibold text-foreground">Item Name</th>
               <th className="py-2 text-center font-semibold text-foreground">Qty</th>
               <th className="py-2 text-right font-semibold text-foreground">Price</th>
               <th className="py-2 text-right font-semibold text-foreground">Total</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-gray-100">
             {completedBill.items.map((item: any, i: number) => (
               <tr key={i}>
                 <td className="py-3">
                   <p className="font-medium text-foreground">{item.productName}</p>
                   <p className="text-xs text-muted-foreground">Batch: {item.batchNumber}</p>
                 </td>
                 <td className="py-3 text-center">{item.quantity}</td>
                 <td className="py-3 text-right">₹{item.sellingPrice.toFixed(2)}</td>
                 <td className="py-3 text-right font-medium text-foreground">₹{item.total.toFixed(2)}</td>
               </tr>
             ))}
           </tbody>
         </table>

         <div className="flex justify-end pt-4 border-t border-gray-300">
           <div className="w-64 space-y-3 text-sm">
             <div className="flex justify-between">
               <span className="text-muted-foreground">Subtotal</span>
               <span className="font-medium">₹{completedBill.subtotal.toFixed(2)}</span>
             </div>
             <div className="flex justify-between">
               <span className="text-muted-foreground">GST</span>
               <span className="font-medium">₹{completedBill.totalGst.toFixed(2)}</span>
             </div>
             {completedBill.discountAmount > 0 && (
               <div className="flex justify-between text-green-600">
                 <span>Discount</span>
                 <span className="font-medium">-₹{completedBill.discountAmount.toFixed(2)}</span>
               </div>
             )}
             <div className="flex justify-between font-bold text-xl pt-3 border-t border-gray-300 text-foreground">
               <span>Grand Total</span>
               <span>₹{completedBill.totalAmount.toFixed(2)}</span>
             </div>
           </div>
         </div>

          <div className="mt-16 text-center text-xs text-muted-foreground space-y-1">
            <p>Thank you for shopping with us!</p>
            <p>Medicines once sold cannot be returned.</p>
          </div>
        </Card>
      </div>
        
      <div className="md:col-span-1 print:hidden">
          <Card className="p-6 text-center space-y-4 shadow-sm border-teal-100 flex flex-col items-center sticky top-6 h-fit">
            <h3 className="font-semibold text-gray-800">Digital Receipt</h3>
            <p className="text-xs text-muted-foreground">Scan QR code to open the digital receipt on your mobile phone.</p>
            
            {receiptUrl && (
              <div className="p-4 bg-white border rounded-xl flex items-center justify-center w-[182px] h-[182px] mx-auto shrink-0">
                <QRCodeSVG value={receiptUrl} size={150} level="M" />
              </div>
            )}
            
            <p className="text-xs text-muted-foreground font-mono mt-2 break-all px-2">
              {receiptUrl}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
