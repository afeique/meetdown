import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import InterestTags from '@/components/InterestTags';
import ProfileEditForm from '@/components/ProfileEditForm';
import ProfileDisplay from '@/components/ProfileDisplay';
import ProfileHeader from '@/components/ProfileHeader';
import Footer from '@/components/Footer';

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
      <ProfileHeader 
        isEditing={isEditing} 
        onToggleEdit={() => setIsEditing(!isEditing)} 
      />

      <div className="flex-1 container mx-auto px-6 py-8 max-w-2xl">
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
