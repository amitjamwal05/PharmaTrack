'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productName: '',
    genericName: '',
    category: 'Tablet',
    manufacturer: '',
    batchNumber: '',
    purchasePrice: '',
    sellingPrice: '',
    quantity: '',
    unit: 'strip',
    reorderLevel: '10',
    expiryDate: '',
    rackNumber: '',
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        const product = res.data;
        
        // Format the date to YYYY-MM-DD for the input type="date"
        const formattedDate = product.expiryDate 
          ? format(new Date(product.expiryDate), 'yyyy-MM-dd') 
          : '';

        setFormData({
          productName: product.productName || '',
          genericName: product.genericName || '',
          category: product.category || 'Tablet',
          manufacturer: product.manufacturer || '',
          batchNumber: product.batchNumber || '',
          purchasePrice: product.purchasePrice || '',
          sellingPrice: product.sellingPrice || '',
          quantity: product.quantity || '',
          unit: product.unit || '',
          reorderLevel: product.reorderLevel || '10',
          expiryDate: formattedDate,
          rackNumber: product.rackNumber || '',
        });
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch product');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/products/${id}`, {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        quantity: Number(formData.quantity),
        reorderLevel: Number(formData.reorderLevel),
      });
      toast.success('Product updated successfully!');
      router.push(`/products/${id}`); // Redirect back to product details page
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Failed to update product.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground animate-pulse">Loading product data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center space-x-4">
        <Link href={`/products/${id}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Edit Product</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <Input name="productName" required value={formData.productName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Generic Name</label>
                <Input name="genericName" value={formData.genericName} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="Tablet">Tablet</option>
                  <option value="Capsule">Capsule</option>
                  <option value="Syrup">Syrup</option>
                  <option value="Injection">Injection</option>
                  <option value="Ointment">Ointment</option>
                  <option value="Drops">Drops</option>
                  <option value="Inhaler">Inhaler</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Manufacturer / Company</label>
                <Input name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Batch Number *</label>
                <Input name="batchNumber" required value={formData.batchNumber} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date *</label>
                <Input type="date" name="expiryDate" required value={formData.expiryDate} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Price (₹)</label>
                <Input type="number" step="0.01" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Selling Price (₹) *</label>
                <Input type="number" step="0.01" name="sellingPrice" required value={formData.sellingPrice} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Quantity</label>
                <Input type="number" name="quantity" required value={formData.quantity} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Input name="unit" placeholder="e.g. strip, bottle" value={formData.unit} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reorder Level</label>
                <Input type="number" name="reorderLevel" value={formData.reorderLevel} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rack Number</label>
                <Input name="rackNumber" value={formData.rackNumber} onChange={handleChange} />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Link href={`/products/${id}`}>
                <Button variant="outline" type="button">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700">
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
