
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDisplayName } from '@/lib/nameUtils';
import PhoneVerificationModal from './PhoneVerificationModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  date_of_birth: string | null;
  email_verified: boolean;
  phone_verified: boolean;
}

interface ProfileDisplayProps {
  profile: Profile | null;
}

const ProfileDisplay = ({ profile }: ProfileDisplayProps) => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);
  const [updatingSmsPrefs, setUpdatingSmsPrefs] = useState(false);

  const handlePhoneVerificationSuccess = async () => {
    await refreshProfile();
    setIsPhoneModalOpen(false);
  };

  const handleSmsNotificationChange = async (enabled: boolean) => {
    if (!user) return;
    
    setUpdatingSmsPrefs(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sms_notifications_enabled: enabled })
        .eq('id', user.id);

      if (error) throw error;

      setSmsNotificationsEnabled(enabled);
      toast({
        title: enabled ? "SMS notifications enabled" : "SMS notifications disabled",
        description: enabled 
          ? "You'll receive event notifications via SMS" 
          : "You won't receive SMS notifications anymore",
      });
    } catch (error: any) {
      toast({
        title: "Error updating SMS preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingSmsPrefs(false);
    }
  };

  return (
    <>
      {/* Profile Display */}
      <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0 mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile && (profile.first_name || profile.last_name) && (
            <div>
              <label className="text-sm font-medium text-gray-600">Name</label>
              <p className="text-lg font-semibold text-gray-800">
                {formatDisplayName(profile.first_name, profile.last_name)}
              </p>
            </div>
          )}

          {profile?.email && (
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-800">{profile.email}</p>
              <p className="text-xs text-gray-500">
                {profile.email_verified ? '✅ Verified' : '⚠️ Not verified'}
              </p>
            </div>
          )}

          {profile?.phone && (
            <div>
              <label className="text-sm font-medium text-gray-600">Phone</label>
              <p className="text-gray-800">{profile.phone}</p>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-xs text-gray-500">
                  {profile.phone_verified ? '✅ Verified' : '⚠️ Not verified'}
                </p>
                {!profile.phone_verified && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Phone className="h-3 w-3" />
                    Verify Phone Number
                  </Button>
                )}
              </div>
              
              {profile.phone_verified && (
                <div className="flex items-center space-x-2 mt-3">
                  <Checkbox
                    id="sms-notifications"
                    checked={smsNotificationsEnabled}
                    onCheckedChange={handleSmsNotificationChange}
                    disabled={updatingSmsPrefs}
                  />
                  <label
                    htmlFor="sms-notifications"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Allow event SMS notifications
                  </label>
                </div>
              )}
            </div>
          )}

          {profile?.date_of_birth && (
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
              <p className="text-gray-800">
                {new Date(profile.date_of_birth).toLocaleDateString()}
              </p>
            </div>
          )}

          {profile?.bio && (
            <div>
              <label className="text-sm font-medium text-gray-600">Bio</label>
              <p className="text-gray-800">{profile.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Links Card */}
      <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0 mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <User size={20} />
            Social
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/followers')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <User size={16} />
              View My Followers
            </Button>
          </div>
        </CardContent>
      </Card>

      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={handlePhoneVerificationSuccess}
        initialPhone={profile?.phone || ''}
      />
    </>
  );
};

export default ProfileDisplay;
