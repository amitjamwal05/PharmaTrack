import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Barcode } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProductSearchProps {
  products: any[];
  onSelectProduct: (product: any) => void;
}

export default function ProductSearch({ products, onSelectProduct }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on mount to be ready for barcode scanner
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const filteredProducts = products.filter(product => {
    if (!searchTerm) return false;
    const term = searchTerm.toLowerCase();
    return (
      product.productName.toLowerCase().includes(term) ||
      product.batchNumber.toLowerCase().includes(term) ||
      (product.composition && product.composition.toLowerCase().includes(term))
    );
  }).slice(0, 5); // show top 5 matches

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  const handleSelect = (product: any) => {
    if (product.quantity <= 0) return; // Prevent adding out of stock
    onSelectProduct(product);
    setSearchTerm('');
    setSelectedIndex(0);
    // Return focus to input for next scan
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchTerm) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      
      // If there's an exact barcode match (simulating physical scanner)
      // Usually physical scanners type the barcode instantly and hit enter.
      // If there's exactly 1 match, pick it.
      if (filteredProducts.length === 1) {
        handleSelect(filteredProducts[0]);
        return;
      }

      // Otherwise pick the currently focused item from keyboard navigation
      if (filteredProducts.length > 0 && selectedIndex >= 0) {
        handleSelect(filteredProducts[selectedIndex]);
      }
    }
  };

  // Generate a few quick-adds from available stock (simulating popular OTC items)
  const quickAdds = products.filter(p => p.quantity > 0).slice(0, 4);

  return (
    <Card className="overflow-visible z-50 relative">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Add Products</span>
          <Badge variant="outline" className="text-teal-600 border-teal-200 bg-teal-50 flex items-center gap-1">
            <Barcode className="w-3 h-3" /> Scanner Ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Input 
            ref={inputRef}
            placeholder="Scan barcode, or search by name, batch, generic..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full h-12 text-lg shadow-sm focus:border-teal-500 focus:ring-teal-500 transition-all"
            autoFocus
          />
          
          {searchTerm && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground text-center">No products found</div>
              ) : (
                filteredProducts.map((product, idx) => {
                  const isSelected = idx === selectedIndex;
                  const isOutOfStock = product.quantity <= 0;
                  
                  return (
                    <div 
                      key={product._id} 
                      className={`flex justify-between p-3 border-b border-border transition-colors ${
                        isOutOfStock 
                          ? 'opacity-50 cursor-not-allowed bg-muted/50' 
                          : isSelected 
                            ? 'bg-teal-50 dark:bg-teal-900/40 cursor-pointer' 
                            : 'hover:bg-accent cursor-pointer'
                      }`}
                      onClick={() => !isOutOfStock && handleSelect(product)}
                      onMouseEnter={() => !isOutOfStock && setSelectedIndex(idx)}
                    >
                      <div>
                        <div className={`font-medium text-sm ${isOutOfStock ? 'text-muted-foreground' : 'text-foreground'}`}>
                          {product.productName}
                          {isOutOfStock && <span className="ml-2 text-xs font-bold text-red-500">OUT OF STOCK</span>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Batch: {product.batchNumber} | Stock: {product.quantity}
                          {product.composition && ` | ${product.composition}`}
                        </div>
                      </div>
                      <div className={`flex items-center text-sm font-bold ${isOutOfStock ? 'text-muted-foreground' : 'text-teal-600 dark:text-teal-400'}`}>
                        ₹{product.sellingPrice || product.price}
                        {!isOutOfStock && <Plus className="w-4 h-4 ml-2" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Quick Adds Section */}
        {quickAdds.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Adds (In Stock)</p>
            <div className="flex flex-wrap gap-2">
              {quickAdds.map(product => (
                <Button 
                  key={`quick-${product._id}`} 
                  variant="outline" 
                  size="sm"
                  className="bg-background hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-colors"
                  onClick={() => handleSelect(product)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {product.productName}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
