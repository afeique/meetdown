import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InterestTags from '@/components/InterestTags';
import ProfileEditForm from '@/components/ProfileEditForm';
import ProfileDisplay from '@/components/ProfileDisplay';
import TopBar from '@/components/TopBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

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

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <TopBar 
        showBackButton={true} 
        title={isEditing ? 'Edit Profile' : 'My Profile'} 
      />

      <div className="flex-1 container mx-auto px-6 py-8 max-w-2xl">
        <div className="flex justify-end mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            <Edit size={16} />
            {isEditing ? 'View Profile' : 'Edit Profile'}
          </Button>
        </div>

        {isEditing ? (
          <ProfileEditForm />
        ) : (
          <>
            <ProfileDisplay profile={profile} />
            <InterestTags />
          </>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Profile;
