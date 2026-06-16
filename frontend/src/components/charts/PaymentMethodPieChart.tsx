import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PaymentMethodPieChartProps {
  data: { name: string; value: number }[];
  title?: string;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6']; // Green (Cash), Blue (UPI), Orange (Card)

export function PaymentMethodPieChart({ data, title = "Payment Methods Today" }: PaymentMethodPieChartProps) {
  return (
    <Card className="border-t-4 border-t-emerald-500 shadow-md h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-muted rounded border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No sales today</p>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => `₹${Number(value).toFixed(2)}`}
                  contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
