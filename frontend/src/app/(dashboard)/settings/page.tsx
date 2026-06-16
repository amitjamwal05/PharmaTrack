'use client';

import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/components/settings/UserProfile';
import { PlatformStatus } from '@/components/settings/PlatformStatus';
import { StaffManagement } from '@/components/settings/StaffManagement';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <UserProfile user={user} />
        <PlatformStatus user={user} />
      </div>

      <StaffManagement user={user} />
    </div>
  );
}
