import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import api from '@/lib/api';

interface UpdateInventoryFormProps {
  products: any[];
  onSuccess: () => void;
}

export function UpdateInventoryForm({ products, onSuccess }: UpdateInventoryFormProps) {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('purchase');
  const [actionType, setActionType] = useState('add');

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error('Please select a product from the list');
      return;
    }

    try {
      if (actionType === 'add') {
        await api.post('/stock/add', {
          productId: selectedProduct,
          quantityToAdd: Number(quantity),
        });
        toast.success('Stock added successfully');
      } else {
        await api.post('/stock/adjust', {
          productId: selectedProduct,
          newQuantity: Number(quantity),
          reason,
        });
        toast.success('Stock adjusted successfully');
      }
      setQuantity('');
      setSearchTerm('');
      setSelectedProduct('');
      onSuccess(); // Refresh all data
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="overflow-visible sticky top-6 z-20">
      <CardHeader>
        <CardTitle>Update Inventory</CardTitle>
        <CardDescription>Add new stock or manually adjust existing stock levels.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Action Type</label>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-md hover:bg-muted">
                <input 
                  type="radio" 
                  checked={actionType === 'add'} 
                  onChange={() => setActionType('add')} 
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">Add New Stock</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer p-2 border rounded-md hover:bg-muted">
                <input 
                  type="radio" 
                  checked={actionType === 'adjust'} 
                  onChange={() => setActionType('adjust')} 
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm">Manual Adjustment</span>
              </label>
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium">Search Product</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Name or batch number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedProduct(''); // Clear selection if user types
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                className="w-full pr-10 truncate"
                required={!selectedProduct}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedProduct('');
                    setShowDropdown(true);
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {showDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border shadow-xl rounded-md max-h-[300px] overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <div className="p-3 text-sm text-muted-foreground">No products found.</div>
                ) : (
                  filteredProducts.map(p => (
                    <div
                      key={p._id}
                      className="px-3 py-3 border-b last:border-b-0 cursor-pointer hover:bg-muted"
                      onClick={() => {
                        setSelectedProduct(p._id);
                        setSearchTerm(`${p.productName} (Batch: ${p.batchNumber})`);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="font-medium">{p.productName}</div>
                      <div className="text-xs text-muted-foreground flex justify-between mt-1">
                        <span>Batch: {p.batchNumber}</span>
                        <span className="text-teal-600 dark:text-teal-400 font-bold">In Stock: {p.quantity}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {actionType === 'add' ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity to Add</label>
              <Input 
                type="number" 
                required 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                placeholder="e.g. 50"
                min="1"
              />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">New Total Quantity</label>
                <Input 
                  type="number" 
                  required 
                  value={quantity} 
                  onChange={(e) => setQuantity(e.target.value)} 
                  placeholder="e.g. 45"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for Adjustment</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="damaged">Damaged / Broken</option>
                  <option value="expired">Expired</option>
                  <option value="returned">Returned to Supplier</option>
                  <option value="correction">Inventory Correction</option>
                </select>
              </div>
            </>
          )}

          <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 h-11 text-base font-semibold mt-2">
            Update Stock
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
