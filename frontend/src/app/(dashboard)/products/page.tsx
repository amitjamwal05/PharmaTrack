'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
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
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

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
      e.preventDefault();
      setShowPaywall(true);
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
                    <TableCell colSpan={7} className="text-center py-10">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProducts.map((product) => (
                    <TableRow key={product._id}>
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
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant={currentPage === i + 1 ? 'default' : 'outline'}
                      size="sm"
                      className={`w-8 h-8 p-0 ${currentPage === i + 1 ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
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

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Monthly */}
              <div className="border border-border bg-background rounded-xl p-6 flex flex-col hover:border-teal-500 transition-colors">
                <h3 className="text-xl font-bold mb-2">Monthly</h3>
                <div className="text-3xl font-extrabold text-teal-600 mb-4">₹999<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
                <ul className="space-y-2 mb-6 flex-1 text-sm text-muted-foreground">
                  <li>✓ Unlimited Products</li>
                  <li>✓ Basic Reporting</li>
                  <li>✓ Email Support</li>
                </ul>
              </div>
              
              {/* Quarterly */}
              <div className="border-2 border-teal-500 bg-teal-50 dark:bg-teal-900/20 rounded-xl p-6 flex flex-col relative transform scale-105 shadow-xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Recommended
                </div>
                <h3 className="text-xl font-bold mb-2 text-teal-900 dark:text-teal-100">Quarterly</h3>
                <div className="text-3xl font-extrabold text-teal-600 mb-4">₹2,499<span className="text-sm text-teal-700/70 dark:text-teal-400/70 font-normal">/qtr</span></div>
                <ul className="space-y-2 mb-6 flex-1 text-sm text-teal-800 dark:text-teal-300">
                  <li>✓ Unlimited Products</li>
                  <li>✓ Advanced Analytics</li>
                  <li>✓ Priority Support</li>
                  <li>✓ Save ~16%</li>
                </ul>
              </div>

              {/* Annually */}
              <div className="border border-border bg-background rounded-xl p-6 flex flex-col hover:border-teal-500 transition-colors">
                <h3 className="text-xl font-bold mb-2">Annually</h3>
                <div className="text-3xl font-extrabold text-teal-600 mb-4">₹8,999<span className="text-sm text-muted-foreground font-normal">/yr</span></div>
                <ul className="space-y-2 mb-6 flex-1 text-sm text-muted-foreground">
                  <li>✓ Unlimited Products</li>
                  <li>✓ Custom Reports</li>
                  <li>✓ 24/7 Phone Support</li>
                  <li>✓ Save ~25%</li>
                </ul>
              </div>
            </div>

            <div className="bg-muted p-6 rounded-xl text-center border border-border">
              <h4 className="font-semibold text-lg mb-2">Ready to subscribe?</h4>
              <p className="text-muted-foreground mb-4">
                Please drop an email to discuss your preferred plan and complete the payment. 
                Once payment is received, your store will be instantly approved by our Super Admin.
              </p>
              <a 
                href="mailto:amitjamwal005@gmail.com?subject=PharmaTrack%20Subscription%20Plan" 
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 shadow-sm transition-all"
              >
                Contact: amitjamwal005@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
