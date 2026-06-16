import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

export function GlobalAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (error) {
      console.error('Error fetching announcements', error);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted successfully.');
      fetchAnnouncements();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    }
  };

  const handleBroadcast = async () => {
    const title = (document.getElementById('ann-title') as HTMLInputElement).value;
    const message = (document.getElementById('ann-message') as HTMLInputElement).value;
    const type = (document.getElementById('ann-type') as HTMLSelectElement).value;
    if(!title || !message) { toast.error('Title and message required'); return; }
    try {
      await api.post('/announcements', { title, message, type });
      toast.success('Announcement broadcasted!');
      (document.getElementById('ann-title') as HTMLInputElement).value = '';
      (document.getElementById('ann-message') as HTMLInputElement).value = '';
      fetchAnnouncements();
    } catch(e) {
      toast.error('Failed to create announcement');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Announcements</CardTitle>
        <CardDescription>Broadcast messages to all users across all stores.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input id="ann-title" placeholder="e.g. Scheduled Maintenance" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select id="ann-type" className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                <option value="info">Info (Blue)</option>
                <option value="warning">Warning (Yellow)</option>
                <option value="error">Error (Red)</option>
                <option value="success">Success (Green)</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Input id="ann-message" placeholder="Type your announcement message here..." />
          </div>
          <Button onClick={handleBroadcast} className="w-full bg-teal-600 hover:bg-teal-700 text-white">
            Broadcast Announcement
          </Button>
        </div>
        
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Active Announcements</h3>
          {announcements.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active announcements.</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann._id} className="flex items-center justify-between p-4 border rounded-md bg-muted/20">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        ann.type === 'error' ? 'bg-red-100 text-red-700' : 
                        ann.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                        ann.type === 'success' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {ann.type}
                      </span>
                      <h4 className="font-semibold">{ann.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{ann.message}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteAnnouncement(ann._id)}>
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
