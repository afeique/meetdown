
import { formatDisplayName } from '@/lib/nameUtils';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  country_code: string | null;
  phone_number: string | null;
  date_of_birth: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  sms_notifications_enabled: boolean | null;
}

interface ProfileInfoProps {
  profile: Profile | null;
  onVerifyPhone: () => void;
}

const formatPhoneDisplay = (countryCode: string | null, phoneNumber: string | null): string => {
  if (!countryCode || !phoneNumber) return '';
  
  // Remove any formatting from phone number and add it back
  const digits = phoneNumber.replace(/\D/g, '');
  
  if (digits.length === 10) {
    const formatted = digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    // Don't add extra + if country code already has it
    const cleanCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
    return `${cleanCountryCode} ${formatted}`;
  }
  
  // For other lengths, just combine country code and phone number
  const cleanCountryCode = countryCode.startsWith('+') ? countryCode : `+${countryCode}`;
  return `${cleanCountryCode} ${phoneNumber}`;
};

const ProfileInfo = ({ profile, onVerifyPhone }: ProfileInfoProps) => {
  return (
    <div className="space-y-4">
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

      {(profile?.country_code && profile?.phone_number) && (
        <div>
          <label className="text-sm font-medium text-gray-600">Phone</label>
          <p className="text-gray-800">{formatPhoneDisplay(profile.country_code, profile.phone_number)}</p>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-gray-500">
              {profile.phone_verified ? '✅ Verified' : '⚠️ Not verified'}
            </p>
            {!profile.phone_verified && (
              <Button
                variant="outline"
                size="sm"
                onClick={onVerifyPhone}
                className="flex items-center gap-1"
              >
                <Phone className="h-3 w-3" />
                Verify Phone Number
              </Button>
            )}
          </div>
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
    </div>
  );
};

export default ProfileInfo;
