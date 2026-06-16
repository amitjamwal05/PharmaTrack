import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface ProfitMarginBarChartProps {
  data: { date: string; revenue: number; profit: number }[];
  title?: string;
}

export function ProfitMarginBarChart({ data, title = "Revenue vs Profit Margin" }: ProfitMarginBarChartProps) {
  return (
    <Card className="border-t-4 border-t-blue-500 shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-80 bg-muted rounded border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        ) : (
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--color-muted)', opacity: 0.4 }}
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                  formatter={(value: any, name: any) => [`₹${Number(value).toFixed(2)}`, String(name).charAt(0).toUpperCase() + String(name).slice(1)]}
                  labelStyle={{ color: 'var(--color-muted-foreground)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', color: 'var(--color-muted-foreground)' }} />
                <Bar dataKey="revenue" name="Total Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Gross Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
