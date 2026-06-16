import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface ProductSearchProps {
  products: any[];
  onSelectProduct: (product: any) => void;
}

export default function ProductSearch({ products, onSelectProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = products.filter(product => 
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5); // show top 5 matches

  const handleSelect = (product: any) => {
    onSelectProduct(product);
    setSearchTerm('');
  };

  return (
    <Card className="overflow-visible z-50 relative">
      <CardHeader className="pb-3">
        <CardTitle>Add Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <Input 
            placeholder="Search product by name or batch..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredProducts.length === 1) {
                handleSelect(filteredProducts[0]);
                e.preventDefault();
              }
            }}
            className="w-full"
            autoFocus
          />
          
          {searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
              {filteredProducts.length === 0 ? (
                <div className="p-3 text-sm text-muted-foreground">No products found</div>
              ) : (
                filteredProducts.map(product => (
                  <div 
                    key={product._id} 
                    className="flex justify-between p-3 border-b border-border hover:bg-teal-50 dark:hover:bg-teal-900/30 cursor-pointer transition-colors"
                    onClick={() => handleSelect(product)}
                  >
                    <div>
                      <div className="font-medium text-sm text-foreground">{product.productName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">Batch: {product.batchNumber} | Stock: {product.quantity}</div>
                    </div>
                    <div className="flex items-center text-sm font-medium text-teal-600 dark:text-teal-400">
                      ₹{product.sellingPrice || product.price}
                      <Plus className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
