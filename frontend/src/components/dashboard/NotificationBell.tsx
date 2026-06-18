import { useState } from 'react';
import { Bell, AlertTriangle, Info, PackageX } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from 'next/navigation';

export default function NotificationBell({ announcements }: { announcements: any[] }) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const router = useRouter();

  const getAlertIcon = (category: string, type?: string) => {
    if (category === 'expiry') return <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />;
    if (category === 'low_stock') return <PackageX className="w-4 h-4 mr-2 text-red-500" />;
    
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />;
      case 'danger': return <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />;
      default: return <Info className="w-4 h-4 mr-2 text-blue-500" />;
    }
  };

  const handleNotificationClick = (ann: any) => {
    if (ann.category === 'expiry') {
      router.push(`/expiry?search=${encodeURIComponent(ann.productName)}`);
    } else if (ann.category === 'low_stock') {
      router.push(`/stock?search=${encodeURIComponent(ann.productName)}`);
    } else {
      setSelectedAnnouncement(ann);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="p-2 relative text-muted-foreground hover:text-teal-600 transition-colors outline-none cursor-pointer">
          <Bell className="w-5 h-5" />
          {announcements.length > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-card"></span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="px-2 py-1.5 text-sm font-semibold">Notifications</div>
          <DropdownMenuSeparator />
          {announcements.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No new notifications
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {announcements.map((ann) => (
                <DropdownMenuItem 
                  key={ann._id} 
                  className="flex flex-col items-start p-3 focus:bg-muted cursor-pointer"
                  onClick={() => handleNotificationClick(ann)}
                >
                  <div className="flex items-center font-semibold mb-1">
                    {getAlertIcon(ann.category, ann.type)}
                    <span>{ann.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground line-clamp-2">{ann.message}</span>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg">
              {selectedAnnouncement && getAlertIcon(selectedAnnouncement.category, selectedAnnouncement.type)}
              {selectedAnnouncement?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm mt-4 text-foreground leading-relaxed whitespace-pre-wrap">
            {selectedAnnouncement?.message}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
