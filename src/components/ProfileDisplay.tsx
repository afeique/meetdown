
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PhoneVerificationModal from './PhoneVerificationModal';
import ProfileInfo from './profile/ProfileInfo';
import SmsNotificationToggle from './profile/SmsNotificationToggle';
import SocialSection from './profile/SocialSection';
import { useAuth } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
  country_code: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  sms_notifications_enabled: boolean | null;
}

interface ProfileDisplayProps {
  profile: Profile | null;
}

const ProfileDisplay = ({ profile }: ProfileDisplayProps) => {
  const { refreshProfile } = useAuth();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const handlePhoneVerificationSuccess = async () => {
    await refreshProfile();
    setIsPhoneModalOpen(false);
  };

  // Get full phone number for verification modal
  const getFullPhoneNumber = () => {
    if (!profile?.country_code || !profile?.phone_number) return '';
    return profile.country_code + profile.phone_number;
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
          <ProfileInfo 
            profile={profile} 
            onVerifyPhone={() => setIsPhoneModalOpen(true)} 
          />
          
          {(profile?.country_code && profile?.phone_number) && (
            <SmsNotificationToggle 
              isPhoneVerified={profile.phone_verified}
              initialEnabled={profile.sms_notifications_enabled}
            />
          )}
        </CardContent>
      </Card>

      <SocialSection />

      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSuccess={handlePhoneVerificationSuccess}
        initialPhone={getFullPhoneNumber()}
      />
    </>
  );
};

export default ProfileDisplay;
