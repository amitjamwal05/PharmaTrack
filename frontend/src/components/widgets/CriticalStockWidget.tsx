import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function CriticalStockWidget({ data }: { data: any[] }) {
  const router = useRouter();

  return (
    <Card className="h-full border-orange-200 dark:border-orange-900/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-500" />
          Critical Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-4 mt-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg shrink-0">
                    <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.productName || item.name || 'Unknown Product'}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.category || 'Uncategorized'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-2">
                  <div className="text-right">
                    <div className={`text-sm font-bold ${item.quantity === 0 ? 'text-red-500' : 'text-orange-500'}`}>
                      {item.quantity} left
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-7 text-xs border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 dark:border-orange-800"
                    onClick={() => router.push('/stock')}
                  >
                    Reorder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
            <Package className="w-8 h-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Stock levels are healthy.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
