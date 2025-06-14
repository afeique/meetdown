
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDisplayName } from '@/lib/nameUtils';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
  email_verified: boolean;
}

const UserProfileHeader = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [fullProfile, setFullProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, email, email_verified')
          .eq('id', user.id)
          .single();

        setFullProfile(profile);
      }
    };

    fetchUserProfile();
  }, [user, userProfile]);

  const getInitials = () => {
    if (!fullProfile) return 'U';
    const firstName = fullProfile.first_name?.charAt(0) || '';
    const lastName = fullProfile.last_name?.charAt(0) || '';
    return `${firstName}${lastName}`.toUpperCase() || 'U';
  };

  const getDisplayName = () => {
    if (fullProfile?.first_name || fullProfile?.last_name) {
      return formatDisplayName(fullProfile.first_name, fullProfile.last_name);
    }
    if (fullProfile?.email) {
      return fullProfile.email.split('@')[0];
    }
    return 'User';
  };

  const handleClick = () => {
    navigate('/profile');
  };

  return (
    <div 
      className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      onClick={handleClick}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={fullProfile?.avatar_url || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-semibold">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      <div className="flex items-center gap-2">
        <span className="text-gray-700 font-medium">{getDisplayName()}</span>
        {fullProfile?.email_verified ? (
          <div title="Email verified">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        ) : (
          <div title="Email not verified">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileHeader;
