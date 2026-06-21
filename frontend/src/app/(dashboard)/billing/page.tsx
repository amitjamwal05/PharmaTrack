'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Trash2, Plus, Receipt as ReceiptIcon, Printer, ArrowLeft, Loader2, Search, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import Receipt from '@/components/billing/Receipt';
import ProductSearch from '@/components/billing/ProductSearch';
import { PaywallModal } from '@/components/dashboard/PaywallModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function BillingPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedBill, setCompletedBill] = useState<any>(null);
  const [showPaywall, setShowPaywall] = useState(false);

  useEffect(() => {
    if (user?.subscriptionPlan === 'expired') {
      setShowPaywall(true);
    } else {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product._id);
    if (existingItem) {
      if (existingItem.quantity >= product.quantity) {
        toast.error(`Only ${product.quantity} units available`);
        return;
      }
      setCart(cart.map(item => 
        item.productId === product._id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      if (product.quantity < 1) {
        toast.error('Out of stock');
        return;
      }
      setCart([...cart, {
        productId: product._id,
        productName: product.productName,
        batchNumber: product.batchNumber,
        sellingPrice: product.sellingPrice || product.price,
        gstRate: product.gstRate,
        maxQty: product.quantity,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (productId: string, newQty: number) => {
    if (newQty < 1) return;
    const item = cart.find(i => i.productId === productId);
    if (item && newQty > item.maxQty) {
      toast.error(`Only ${item.maxQty} units available`);
      return;
    }
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQty } 
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
  const totalGst = cart.reduce((acc, item) => acc + ((item.sellingPrice * item.quantity) * (item.gstRate || 0) / 100), 0);
  const totalAmount = subtotal + totalGst - discountAmount;

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const payload = {
      customerName,
      customerPhone,
      paymentMethod,
      discountAmount,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    try {
      setIsSubmitting(true);
      const res = await api.post('/bills', payload);
      
      toast.success('Payment completed successfully!', {
        action: {
          label: 'Download Invoice PDF',
          onClick: () => generateInvoicePDF(res.data)
        },
        duration: 10000,
      });
      
      setCompletedBill(res.data);
      
      // Clear cart
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscountAmount(0);
      setPaymentMethod('cash');
      
      // Refresh products to get updated stock
      fetchProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create bill');
    } finally {
      setIsSubmitting(false);
    }
  }, [user, cart, customerName, customerPhone, paymentMethod, discountAmount]);

  const generateInvoicePDF = (billData: any) => {
    const doc = new jsPDF();
    
    // Store Info
    doc.setFontSize(20);
    doc.text(user?.storeName || 'PharmaTrack Store', 14, 22);
    
    doc.setFontSize(10);
    // Since we don't have storeId populated with full details everywhere, we'll try to display it if available
    doc.text(`Store Address / GSTIN`, 14, 30);
    
    // Bill Info
    doc.setFontSize(12);
    doc.text('TAX INVOICE', 14, 45);
    doc.setFontSize(10);
    doc.text(`Bill No: ${billData.billNumber}`, 14, 52);
    doc.text(`Date: ${new Date(billData.createdAt).toLocaleString()}`, 14, 58);
    
    if (billData.customerName) doc.text(`Customer: ${billData.customerName}`, 14, 64);
    if (billData.customerPhone) doc.text(`Phone: ${billData.customerPhone}`, 14, 70);

    const tableColumn = ["Item", "Batch", "Qty", "Price", "GST", "Total"];
    const tableRows = billData.items.map((item: any) => [
      item.productName,
      item.batchNumber || '-',
      item.quantity,
      `Rs. ${item.sellingPrice.toFixed(2)}`,
      `Rs. ${(item.gstAmount || 0).toFixed(2)}`,
      `Rs. ${item.total.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [13, 148, 136] } // Teal-600
    });

    // @ts-ignore
    const finalY = (doc as any).lastAutoTable?.finalY || 80;
    
    doc.text(`Subtotal: Rs. ${billData.subtotal.toFixed(2)}`, 140, finalY + 10);
    doc.text(`Total GST: Rs. ${billData.totalGst.toFixed(2)}`, 140, finalY + 16);
    if (billData.discountAmount > 0) {
      doc.text(`Discount: Rs. ${billData.discountAmount.toFixed(2)}`, 140, finalY + 22);
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: Rs. ${billData.totalAmount.toFixed(2)}`, 140, finalY + 30);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Payment Method: ${billData.paymentMethod.toUpperCase()}`, 14, finalY + 30);

    doc.text('Thank you for your business!', 14, finalY + 50);

    doc.save(`${billData.billNumber}.pdf`);
  };

  if (completedBill) {
    return <Receipt completedBill={completedBill} user={user} onNewBill={() => setCompletedBill(null)} />;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Billing / POS</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Column - Product Search and Cart */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          <ProductSearch products={products} onSelectProduct={addToCart} />

          <Card className="max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle>Current Bill</CardTitle>
            </CardHeader>
            <CardContent className="p-4 max-w-full">
              <div className="rounded-md border overflow-x-auto max-w-full w-full">
                <Table className="min-w-[500px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-24">Price</TableHead>
                      <TableHead className="w-32 text-center">Qty</TableHead>
                      <TableHead className="w-24 text-right">Total</TableHead>
                      <TableHead className="w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                          <div className="flex flex-col items-center justify-center">
                            <ShoppingCart className="h-10 w-10 mb-3 text-muted-foreground/40" />
                            <h3 className="text-base font-medium text-foreground">Cart is empty</h3>
                            <p className="text-sm mt-1">Search and select products to add them to the bill.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      cart.map((item) => (
                        <TableRow key={item.productId} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors border-l-2 border-transparent hover:border-teal-500">
                          <TableCell>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">Batch: {item.batchNumber}</div>
                          </TableCell>
                          <TableCell>₹{item.sellingPrice}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center space-x-2">
                              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</Button>
                              <span className="w-6 text-center">{item.quantity}</span>
                              <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">₹{(item.sellingPrice * item.quantity).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.productId)}>
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
        </div>

        {/* Right Column - Cart */}
        <div className="space-y-6 lg:col-span-1 max-w-full min-w-0">
          <Card className="max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Customer Name</label>
                <Input 
                  placeholder="Optional" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input 
                  type="tel"
                  placeholder="Optional (10 digits)" 
                  value={customerPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 10) {
                      setCustomerPhone(val);
                    }
                  }}
                  maxLength={10}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30 border-teal-100 dark:border-teal-900/50 max-w-full overflow-hidden">
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (Calculated)</span>
                <span className="font-medium">₹{totalGst.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm pt-2">
                <span className="text-muted-foreground">Discount (₹)</span>
                <Input 
                  type="number" 
                  className="w-24 h-8 text-right" 
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  min="0"
                />
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-teal-600 dark:text-teal-400">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-sm font-medium">Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['cash', 'card', 'upi'].map(method => (
                    <Button 
                      key={method}
                      type="button"
                      variant={paymentMethod === method ? 'default' : 'outline'}
                      className={paymentMethod === method ? 'bg-teal-600 hover:bg-teal-700' : ''}
                      onClick={() => setPaymentMethod(method)}
                    >
                      {method.charAt(0).toUpperCase() + method.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full mt-4 bg-teal-600 hover:bg-teal-700 h-12 text-lg font-bold"
                onClick={handleCheckout}
                disabled={cart.length === 0 || isSubmitting}
              >
                <ReceiptIcon className="w-5 h-5 mr-2" />
                {isSubmitting ? 'Processing...' : 'Complete Payment'}
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
