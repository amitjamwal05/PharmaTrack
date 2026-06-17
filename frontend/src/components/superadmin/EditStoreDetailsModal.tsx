import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditStoreDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeDetails: {
    storeId: string;
    storeName: string;
    adminName: string;
    phone: string;
  };
  onSubmit: (storeId: string, data: { name: string; adminName: string; phone: string }) => Promise<void>;
}

export function EditStoreDetailsModal({ isOpen, onClose, storeDetails, onSubmit }: EditStoreDetailsModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    adminName: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: storeDetails.storeName || '',
        adminName: storeDetails.adminName || '',
        phone: storeDetails.phone || ''
      });
    }
  }, [isOpen, storeDetails]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(storeDetails.storeId, formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-md p-6 rounded-xl shadow-2xl relative">
        <Button 
          variant="ghost" 
          className="absolute top-4 right-4 rounded-full w-8 h-8 p-0"
          onClick={onClose}
        >
          ✕
        </Button>
        <h2 className="text-xl font-bold mb-4">Edit Store Details</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Update the details for <strong>{storeDetails.storeName}</strong>.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Store Name</label>
            <Input 
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Name</label>
            <Input 
              name="adminName"
              value={formData.adminName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact / Phone</label>
            <Input 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
