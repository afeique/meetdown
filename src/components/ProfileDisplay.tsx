
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDisplayName } from '@/lib/nameUtils';

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
              <p className="text-xs text-gray-500">
                {profile.phone_verified ? '✅ Verified' : '⚠️ Not verified'}
              </p>
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
    </>
  );
};

export default ProfileDisplay;
