import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TopProductsPieChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

const COLORS = ['#0d9488', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];

export function TopProductsPieChart({ data, title = "Top Selling Products" }: TopProductsPieChartProps) {
  return (
    <Card className="border-t-4 border-t-purple-500 shadow-md overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Based on total units sold</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-muted rounded border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No product data available</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`${value} Units`, 'Quantity Sold']}
                    contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px', color: 'var(--color-foreground)' }}
                    itemStyle={{ color: 'var(--color-foreground)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Custom Responsive HTML Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 pb-2 px-2">
              {data.map((entry, index) => (
                <div key={index} className="flex items-center text-xs text-muted-foreground whitespace-normal text-center">
                  <span className="inline-block w-3 h-3 rounded-full mr-2 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
