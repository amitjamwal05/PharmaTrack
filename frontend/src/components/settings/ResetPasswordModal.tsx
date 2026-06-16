import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName: string;
  newPassword: string;
  setNewPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  onSubmit: () => void;
  title?: string;
}

export function ResetPasswordModal({
  isOpen, onClose, staffName, newPassword, setNewPassword, showPassword, setShowPassword, onSubmit, title = "Reset Password"
}: ResetPasswordModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card text-card-foreground border border-border w-full max-w-md p-6 rounded-xl shadow-2xl">
        <h2 className="text-xl font-bold mb-2 text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6">Create a new password for <span className="font-semibold text-teal-500">{staffName}</span>.</p>
        
        <div className="space-y-2 mb-6">
          <label className="text-sm font-medium">New Password</label>
          <div className="relative">
            <Input 
              type={showPassword ? 'text' : 'password'} 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
              className="pr-10"
              autoFocus
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-md">
            Save Password
          </Button>
        </div>
      </div>
    </div>
  );
}
