import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface StaffLeaderboardProps {
  data: { name: string; value: number }[];
  title?: string;
}

export function StaffLeaderboard({ data, title = "Staff Leaderboard Today" }: StaffLeaderboardProps) {
  return (
    <Card className="border-t-4 border-t-amber-500 shadow-md h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-muted rounded border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No sales recorded today</p>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {data.map((staff, index) => (
              <div key={index} className="flex items-center space-x-4 border-b border-border pb-4 last:border-0 last:pb-0">
                <div className={`p-2 rounded-full flex shrink-0 ${index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-500' : index === 1 ? 'bg-slate-200 text-slate-500 dark:bg-slate-800' : index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40' : 'bg-muted text-muted-foreground'}`}>
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{staff.name}</p>
                  <p className="text-xs text-muted-foreground">Rank #{index + 1}</p>
                </div>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-500">
                  ₹{staff.value.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
