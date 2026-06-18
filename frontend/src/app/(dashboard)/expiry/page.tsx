'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AlertCircle, AlertTriangle, CheckCircle2, Search, PackageSearch } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { getPaginationItems } from '@/lib/utils';

export default function ExpiryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, []);

  useEffect(() => {
    const fetchExpiring = async () => {
      try {
        const res = await api.get('/reports/expiry');
        const allProductsRes = await api.get('/products');
        
        // Filter out products with 0 stock, then sort by expiry date ascending
        const sorted = allProductsRes.data
          .filter((p: any) => p.quantity > 0)
          .sort((a: any, b: any) => 
            new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
          );
        
        setProducts(sorted);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExpiring();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const getStatusInfo = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    
    if (days < 0) return { label: 'Expired', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300', icon: AlertCircle, class: 'border-l-4 border-l-gray-500' };
    if (days <= 15) return { label: '< 15 Days', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300', icon: AlertCircle, class: 'border-l-4 border-l-red-500' };
    if (days <= 30) return { label: '15-30 Days', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300', icon: AlertTriangle, class: 'border-l-4 border-l-orange-500' };
    if (days <= 90) return { label: '30-90 Days', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300', icon: AlertTriangle, class: 'border-l-4 border-l-yellow-500' };
    return { label: '> 90 Days', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', icon: CheckCircle2, class: 'border-l-4 border-l-green-500' };
  };

  const filteredProducts = products.filter(product => 
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Expiry Tracking</h1>

      <Card>
        <CardHeader className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Products by Expiry Date</CardTitle>
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products by name or batch..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Batch Number</TableHead>
                  <TableHead className="text-right">Stock Qty</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead className="text-right">Days Left</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Loading products...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <PackageSearch className="h-12 w-12 mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium text-foreground">All clear!</h3>
                        <p className="text-sm mt-1">No products match this status or search query.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProducts.map((product) => {
                    const status = getStatusInfo(product.expiryDate);
                    const daysLeft = differenceInDays(new Date(product.expiryDate), new Date());
                    const StatusIcon = status.icon;
                    
                    return (
                      <TableRow key={product._id} className="hover:bg-teal-50/50 dark:hover:bg-teal-900/20 transition-colors border-l-2 border-transparent hover:border-teal-500">
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">{product.productName}</TableCell>
                        <TableCell>{product.batchNumber}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell>{format(new Date(product.expiryDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className={`text-right font-medium ${daysLeft < 0 ? 'text-muted-foreground' : daysLeft <= 30 ? 'text-red-600' : ''}`}>
                          {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 mt-2">
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
    </div>
  );
}
