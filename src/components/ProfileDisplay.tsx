
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProfileInfo from './profile/ProfileInfo';
import SocialSection from './profile/SocialSection';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  email_verified: boolean;
}

interface ProfileDisplayProps {
  profile: Profile | null;
}

const ProfileDisplay = ({ profile }: ProfileDisplayProps) => {
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
          <ProfileInfo profile={profile} />
        </CardContent>
      </Card>

      <SocialSection />
    </>
  );
};

export default ProfileDisplay;
