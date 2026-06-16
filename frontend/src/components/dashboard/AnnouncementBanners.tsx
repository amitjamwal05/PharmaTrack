import { useState } from 'react';
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export const getAlertIcon = (type: string) => {
  switch (type) {
    case 'warning': return <AlertTriangle className="w-5 h-5 mr-2" />;
    case 'error': return <AlertCircle className="w-5 h-5 mr-2" />;
    case 'success': return <CheckCircle className="w-5 h-5 mr-2" />;
    default: return <Info className="w-5 h-5 mr-2" />;
  }
};

export const getAlertColor = (type: string) => {
  switch (type) {
    case 'warning': return 'bg-amber-500 text-white';
    case 'error': return 'bg-red-500 text-white';
    case 'success': return 'bg-green-500 text-white';
    default: return 'bg-teal-600 text-white';
  }
};

export default function AnnouncementBanners({ announcements }: { announcements: any[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);

  const visibleAnnouncements = announcements.filter(a => !dismissed.includes(a._id));

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="w-full flex flex-col">
      {visibleAnnouncements.map((ann, idx) => (
        <div key={idx} className={`w-full relative flex items-center justify-center py-2 px-10 text-sm font-medium ${getAlertColor(ann.type)}`}>
          <div className="flex items-center">
            {getAlertIcon(ann.type)}
            <span className="font-bold mr-2">{ann.title}:</span> {ann.message}
          </div>
          <button 
            onClick={() => setDismissed([...dismissed, ann._id])}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
