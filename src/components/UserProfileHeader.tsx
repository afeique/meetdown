
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDisplayName } from '@/lib/nameUtils';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

const UserProfileHeader = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, email')
          .eq('id', user.id)
          .single();

        setUserProfile(profile);
      }
    };

    fetchUserProfile();
  }, [user]);

  const getInitials = () => {
    if (!userProfile) return 'U';
    const firstName = userProfile.first_name?.charAt(0) || '';
    const lastName = userProfile.last_name?.charAt(0) || '';
    return `${firstName}${lastName}`.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (userProfile?.first_name || userProfile?.last_name) {
      return formatDisplayName(userProfile.first_name, userProfile.last_name);
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    return 'User';
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={userProfile?.avatar_url || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-semibold">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <span className="text-gray-700 font-medium">{getDisplayName()}</span>
    </div>
  );
};

export default UserProfileHeader;
