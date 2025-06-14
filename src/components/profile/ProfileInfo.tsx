
import { formatDisplayName } from '@/lib/nameUtils';
import { formatPhoneForDisplay } from '@/utils/phoneUtils';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

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
  sms_notifications_enabled: boolean | null;
}

interface ProfileInfoProps {
  profile: Profile | null;
  onVerifyPhone: () => void;
}

const ProfileInfo = ({ profile, onVerifyPhone }: ProfileInfoProps) => {
  const formatDateOfBirth = (dateString: string | null) => {
    if (!dateString) return null;
    
    // Parse the date string as a local date to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString();
  };

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

      {profile?.phone && (
        <div>
          <label className="text-sm font-medium text-gray-600">Phone</label>
          <p className="text-gray-800">{formatPhoneForDisplay(profile.phone)}</p>
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
            {formatDateOfBirth(profile.date_of_birth)}
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
