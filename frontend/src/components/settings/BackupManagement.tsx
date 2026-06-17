import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Download } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export function BackupManagement({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'superadmin') return null;

  const handleBackup = async () => {
    try {
      setLoading(true);
      const res = await api.get('/superadmin/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'pharmatrack_backup.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Database backup generated and downloaded');
    } catch (error) {
      toast.error('Failed to generate backup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <CardTitle>Database Backup</CardTitle>
        </div>
        <CardDescription>Generate a full snapshot of all collections across all tenants.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg border border-border">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Full JSON Snapshot</h4>
            <p className="text-xs text-muted-foreground">Includes Users, Stores, Products, and Bills.</p>
          </div>
          <Button onClick={handleBackup} disabled={loading} className="gap-2">
            <Download className="w-4 h-4" />
            {loading ? 'Generating...' : 'Download Backup'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
