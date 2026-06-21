'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { format } from 'date-fns';
import { getPaginationItems } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
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
import { Plus, Search, Trash2, Edit, PackageSearch, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ProductsPage() {
  const { user, refreshUser } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (planId: string) => {
    try {
      setProcessingPlan(planId);
      
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load');
        setProcessingPlan(null);
        return;
      }
      
      // 1. Create order on backend
      const { data } = await api.post('/payments/create-order', { planId });
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_T4A7frxFe07CHZ', 
        amount: data.amount,
        currency: data.currency,
        name: "PharmaTrack",
        description: `Subscription for ${planId} plan`,
        order_id: data.order_id,
        handler: async function (response: any) {
          const verifyPromise = api.post('/payments/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            planId
          }).then(async () => {
            setShowPaywall(false);
            if (refreshUser) await refreshUser();
          });

          toast.promise(verifyPromise, {
            loading: 'Payment completed! Verifying...',
            success: 'Subscription updated successfully!',
            error: 'Payment verification failed'
          });
        },
        prefill: {
          name: user?.name || "Store Owner",
          email: user?.email,
          contact: user?.storeId?.phone || "9999999999"
        },
        theme: {
          color: "#0d9488"
        }
      };
      
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        toast.error(response.error.description || "Payment failed");
      });
      rzp1.open();
      
    } catch (error: any) {
      console.error('Payment error:', error.response?.data || error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to process payment';
      toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setProcessingPlan(null);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts(); // Refresh list
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const filteredProducts = products.filter(product => 
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleAddProductClick = (e: React.MouseEvent) => {
    if (user?.role !== 'superadmin' && (!user?.subscriptionPlan || user?.subscriptionPlan === 'free' || user?.subscriptionPlan === 'pending')) {
      // Allow exactly 1 free product
      if (products.length >= 1) {
        e.preventDefault();
        setShowPaywall(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Products</h1>
        <Link href="/products/new" onClick={handleAddProductClick}>
          <Button className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products by name or batch..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead className="text-right">Price (₹)</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <PackageSearch className="h-12 w-12 mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-foreground">No products found</h3>
                        <p className="text-sm mt-1">Try adjusting your search query or add a new product.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProducts.map((product) => (
                    <TableRow key={product._id} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors border-l-2 border-transparent hover:border-teal-500">
                      <TableCell className="font-medium">
                        <Link href={`/products/${product._id}`} className="text-teal-600 dark:text-teal-400 hover:underline">
                          {product.productName}
                        </Link>
                      </TableCell>
                      <TableCell>{product.category || 'N/A'}</TableCell>
                      <TableCell>{product.batchNumber}</TableCell>
                      <TableCell className="text-right">{product.sellingPrice || product.price}</TableCell>
                      <TableCell className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.quantity <= product.reorderLevel 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {product.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(product.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Link href={`/products/${product._id}/edit`}>
                            <Button variant="outline" size="icon">
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="icon" onClick={() => handleDelete(product._id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to <span className="font-medium">{Math.min(indexOfLastProduct, filteredProducts.length)}</span> of <span className="font-medium">{filteredProducts.length}</span> results
              </div>
              <div className="flex flex-wrap justify-center items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex flex-wrap items-center gap-1">
                  {getPaginationItems(currentPage, totalPages).map((item, i) => (
                    item === '...' ? (
                      <span key={`ellipsis-${i}`} className="px-2 py-1 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        key={i}
                        variant={currentPage === item ? 'default' : 'outline'}
                        size="sm"
                        className={`w-8 h-8 p-0 ${currentPage === item ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                        onClick={() => setCurrentPage(item as number)}
                      >
                        {item}
                      </Button>
                    )
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-4xl p-8 rounded-2xl shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <Button 
              variant="ghost" 
              className="absolute top-4 right-4 rounded-full w-8 h-8 p-0"
              onClick={() => setShowPaywall(false)}
            >
              ✕
            </Button>
            
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold text-foreground mb-2">Upgrade Your Plan to Add Products</h2>
              <p className="text-muted-foreground text-lg">Your store is currently pending approval. Choose a plan below to unlock full inventory management.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-4">

              {/* Monthly */}
              <div 
                onClick={() => setSelectedPlan('monthly')}
                className={`border rounded-xl p-8 flex flex-col transition-all cursor-pointer ${selectedPlan === 'monthly' ? 'border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 transform md:-translate-y-4 shadow-xl' : 'border-border bg-background hover:border-teal-500 shadow-sm hover:shadow-md'}`}
              >
                <h3 className="text-2xl font-bold mb-2">Monthly</h3>
                <div className="text-4xl font-extrabold text-teal-600 mb-6">₹3,999<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                <ul className="space-y-3 mb-8 flex-1 text-base text-muted-foreground">
                  <li className="flex items-center gap-2">✓ <span>Unlimited Products</span></li>
                  <li className="flex items-center gap-2">✓ <span>Advanced Analytics</span></li>
                  <li className="flex items-center gap-2">✓ <span>Custom Reports</span></li>
                  <li className="flex items-center gap-2">✓ <span>Priority Support</span></li>
                </ul>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg" 
                  onClick={(e) => { e.stopPropagation(); handlePayment('monthly'); }}
                  disabled={processingPlan !== null}
                >
                  {processingPlan === 'monthly' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Pay Monthly
                </Button>
              </div>
              
              {/* Quarterly */}
              <div 
                onClick={() => setSelectedPlan('quarterly')}
                className={`border rounded-xl p-8 flex flex-col relative transition-all cursor-pointer ${selectedPlan === 'quarterly' ? 'border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 transform md:-translate-y-4 shadow-xl' : 'border-border bg-background hover:border-teal-500 shadow-sm hover:shadow-md'}`}
              >
                <h3 className="text-2xl font-bold mb-2 text-teal-900 dark:text-teal-100">Quarterly</h3>
                <div className="text-4xl font-extrabold text-teal-600 mb-6">₹8,999<span className="text-sm text-teal-700/70 dark:text-teal-400/70 font-normal">/qtr</span></div>
                <ul className="space-y-3 mb-8 flex-1 text-base text-teal-800 dark:text-teal-300">
                  <li className="flex items-center gap-2">✓ <span>Unlimited Products</span></li>
                  <li className="flex items-center gap-2">✓ <span>Advanced Analytics</span></li>
                  <li className="flex items-center gap-2">✓ <span>Custom Reports</span></li>
                  <li className="flex items-center gap-2">✓ <span>Priority Support</span></li>
                  <li className="flex items-center gap-2 font-semibold">✓ <span>Save ₹2,998/qtr</span></li>
                </ul>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg shadow-lg" 
                  onClick={(e) => { e.stopPropagation(); handlePayment('quarterly'); }}
                  disabled={processingPlan !== null}
                >
                  {processingPlan === 'quarterly' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Pay Quarterly
                </Button>
              </div>

              {/* Annually */}
              <div 
                onClick={() => setSelectedPlan('annually')}
                className={`border rounded-xl p-8 flex flex-col relative transition-all cursor-pointer ${selectedPlan === 'annually' ? 'border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 transform md:-translate-y-4 shadow-xl' : 'border-border bg-background hover:border-teal-500 shadow-sm hover:shadow-md'}`}
              >
                {selectedPlan === 'annually' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Best Value
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2 text-teal-900 dark:text-teal-100">Annually</h3>
                <div className="text-4xl font-extrabold text-teal-600 mb-6">₹19,999<span className="text-sm text-teal-700/70 dark:text-teal-400/70 font-normal">/yr</span></div>
                <ul className="space-y-3 mb-8 flex-1 text-base text-teal-800 dark:text-teal-300">
                  <li className="flex items-center gap-2">✓ <span>Unlimited Products</span></li>
                  <li className="flex items-center gap-2">✓ <span>Advanced Analytics</span></li>
                  <li className="flex items-center gap-2">✓ <span>Custom Reports</span></li>
                  <li className="flex items-center gap-2">✓ <span>Priority Support</span></li>
                  <li className="flex items-center gap-2 font-semibold">✓ <span>Save ₹27,989/yr</span></li>
                </ul>
                <Button 
                  className="w-full bg-teal-600 hover:bg-teal-700 h-12 text-lg shadow-lg" 
                  onClick={(e) => { e.stopPropagation(); handlePayment('annually'); }}
                  disabled={processingPlan !== null}
                >
                  {processingPlan === 'annually' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Pay Annually
                </Button>
              </div>

            </div>
            
            {/* Temporary Test Button */}
            <div className="mt-8 flex justify-center">
              <Button 
                variant="outline"
                className="border-dashed border-2 border-teal-500 text-teal-600 hover:bg-teal-50"
                onClick={(e) => { e.stopPropagation(); handlePayment('test'); }}
                disabled={processingPlan !== null}
              >
                {processingPlan === 'test' ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                Run ₹1 Test Payment
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
