
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterestTags from '@/components/InterestTags';
import { formatDisplayName } from '@/lib/nameUtils';
import UserProfileHeader from '@/components/UserProfileHeader';
import ProfileEditForm from '@/components/ProfileEditForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                {isEditing ? 'Edit Profile' : 'My Profile'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                <Edit size={16} />
                {isEditing ? 'View Profile' : 'Edit Profile'}
              </Button>
              <UserProfileHeader />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {isEditing ? (
          <ProfileEditForm />
        ) : (
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

            {/* Interests Section */}
            <InterestTags />
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
