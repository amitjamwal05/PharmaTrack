import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export function SmtpConfig({ user }: { user: any }) {
  const [config, setConfig] = useState({ host: '', port: 587, user: '', pass: '' });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (user?.role === 'superadmin') {
      api.get('/superadmin/settings').then(res => {
        if (res.data?.smtpConfig) {
          setConfig(res.data.smtpConfig);
        }
      }).catch(console.error);
    }
  }, [user]);

  if (user?.role !== 'superadmin') return null;

  const handleSave = async () => {
    if (!config.host || !config.user || !config.pass || !config.port) {
      toast.error('All SMTP fields are required');
      return;
    }
    try {
      setLoading(true);
      await api.put('/superadmin/settings/smtp', config);
      toast.success('SMTP Configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save SMTP configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      await api.post('/superadmin/settings/smtp/test', config);
      toast.success('Test email sent successfully! Check your inbox.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send test email. Check credentials.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <CardTitle>Email / SMTP Configuration</CardTitle>
        </div>
        <CardDescription>Custom SMTP settings for sending OTPs and notifications.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">SMTP Host</label>
            <Input value={config.host} onChange={e => setConfig({...config, host: e.target.value})} placeholder="smtp.gmail.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">SMTP Port</label>
            <Input type="number" value={config.port} onChange={e => setConfig({...config, port: Number(e.target.value)})} placeholder="587" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email / Username</label>
            <Input value={config.user} onChange={e => setConfig({...config, user: e.target.value})} placeholder="admin@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">App Password</label>
            <Input type="password" value={config.pass} onChange={e => setConfig({...config, pass: e.target.value})} placeholder="••••••••" />
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2 pt-2">
          <Button variant="outline" onClick={handleTest} disabled={testing || !config.host}>
            {testing ? 'Sending...' : 'Send Test Email'}
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
