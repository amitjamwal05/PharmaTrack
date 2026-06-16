import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function PlatformStatus({ user }: { user: any }) {
  if (user?.role !== 'superadmin') return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <CardTitle>Platform Status</CardTitle>
        </div>
        <CardDescription>Global system configuration and health.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="space-y-0.5">
            <div className="text-sm font-medium">System Version</div>
            <div className="text-xs text-muted-foreground">Current deployment</div>
          </div>
          <div className="text-sm font-mono bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-2 py-1 rounded">
            v2.4.1 (Stable)
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="space-y-0.5">
            <div className="text-sm font-medium">Database Status</div>
            <div className="text-xs text-muted-foreground">MongoDB Connection</div>
          </div>
          <div className="flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <span className="relative flex h-2.5 w-2.5 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Connected
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="space-y-0.5">
            <div className="text-sm font-medium">Maintenance Mode</div>
            <div className="text-xs text-muted-foreground">Disable all tenant logins</div>
          </div>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-300 dark:border-slate-600" disabled />
            <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-slate-300 dark:bg-slate-700 cursor-pointer"></label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
