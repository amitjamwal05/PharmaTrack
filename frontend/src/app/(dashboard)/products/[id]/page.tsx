'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Package, AlertTriangle, IndianRupee, MapPin, Tag, Box, AlertCircle, Edit, Trash2, TrendingUp } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch product details');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, router]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted successfully');
      router.push('/products');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-32" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!product) return null;

  const daysToExpiry = differenceInDays(new Date(product.expiryDate), new Date());
  const isExpiringSoon = daysToExpiry <= 30 && daysToExpiry >= 0;
  const isExpired = daysToExpiry < 0;
  
  const isLowStock = product.quantity <= product.reorderLevel;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/products')} className="mb-2 sm:mb-0">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
        </Button>
        <div className="flex space-x-2">
          <Link href={`/products/${id}/edit`}>
            <Button variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30">
              <Edit className="w-4 h-4 mr-2" /> Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-2">
        <div className="p-3 bg-teal-100 dark:bg-teal-900 rounded-lg">
          <Package className="w-8 h-8 text-teal-700 dark:text-teal-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{product.productName}</h1>
          <p className="text-muted-foreground">{product.genericName || 'No generic name'}</p>
        </div>
      </div>

      {(isExpired || isExpiringSoon || isLowStock) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {isExpired && (
            <div className="p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center text-red-800 dark:text-red-400">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-semibold">Product Expired</p>
                <p className="text-sm">Expired on {format(new Date(product.expiryDate), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          )}
          {isExpiringSoon && !isExpired && (
            <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center text-yellow-800 dark:text-yellow-400">
              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-semibold">Expiring Soon</p>
                <p className="text-sm">Expires in {daysToExpiry} days ({format(new Date(product.expiryDate), 'MMM dd, yyyy')})</p>
              </div>
            </div>
          )}
          {isLowStock && (
            <div className="p-4 bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded-lg flex items-center text-orange-800 dark:text-orange-400">
              <TrendingUp className="w-5 h-5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-semibold">Low Stock Alert</p>
                <p className="text-sm">Only {product.quantity} left (Reorder level: {product.reorderLevel})</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Tag className="w-5 h-5 mr-2 text-teal-600 dark:text-teal-400" />
              Product Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Manufacturer</span>
                <span className="font-medium">{product.manufacturer || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Added On</span>
                <span className="font-medium">{product.createdAt ? format(new Date(product.createdAt), 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Last Updated</span>
                <span className="font-medium">{product.updatedAt ? format(new Date(product.updatedAt), 'MMM dd, yyyy') : 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Prescription Required</span>
                <span className="font-medium">
                  {product.prescriptionRequired ? (
                    <span className="text-red-600 dark:text-red-400 font-semibold">Yes</span>
                  ) : (
                    <span className="text-green-600 dark:text-green-400 font-semibold">No</span>
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Box className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
              Inventory & Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Batch Number</span>
                <span className="font-medium bg-muted px-2 py-1 rounded">{product.batchNumber}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Expiry Date</span>
                <span className={`font-medium ${isExpired ? 'text-red-600 dark:text-red-400' : isExpiringSoon ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                  {format(new Date(product.expiryDate), 'MMM dd, yyyy')}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Current Stock</span>
                <span className={`font-bold text-lg ${isLowStock ? 'text-orange-600 dark:text-orange-400' : 'text-teal-600 dark:text-teal-400'}`}>
                  {product.quantity} {product.unit}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Rack Number</span>
                <span className="font-medium flex items-center">
                  <MapPin className="w-3 h-3 mr-1 text-muted-foreground" />
                  {product.rackNumber || 'Unassigned'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <IndianRupee className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Pricing & Tax
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <span className="text-muted-foreground block mb-1">Purchase Price</span>
                <span className="font-semibold text-lg text-foreground">₹{product.purchasePrice?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg border border-teal-100 dark:border-teal-900/50">
                <span className="text-teal-700 dark:text-teal-400 block mb-1 font-medium">Selling Price</span>
                <span className="font-bold text-xl text-teal-800 dark:text-teal-300">₹{product.sellingPrice?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <span className="text-muted-foreground block mb-1">GST Rate</span>
                <span className="font-semibold text-lg text-foreground">{product.gstRate || 0}%</span>
              </div>
              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <span className="text-muted-foreground block mb-1">Profit Margin</span>
                <span className="font-semibold text-lg text-green-600 dark:text-green-400">
                  {product.purchasePrice 
                    ? `${(((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)}%` 
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
