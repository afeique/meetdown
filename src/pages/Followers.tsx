
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserFollowButton from '@/components/UserFollowButton';

interface Follower {
  id: string;
  follower_id: string;
  follower_profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    bio: string | null;
  };
}

const Followers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFollowers();
    }
  }, [user]);

  const fetchFollowers = async () => {
    setLoading(true);
    try {
      console.log('Fetching followers for user:', user?.id);
      
      const { data: followersData, error } = await supabase
        .from('user_follows')
        .select(`
          id,
          follower_id,
          follower_profile:profiles!user_follows_follower_id_fkey (
            first_name,
            last_name,
            avatar_url,
            bio
          )
        `)
        .eq('following_id', user?.id);

      if (error) {
        console.error('Error fetching followers:', error);
        throw error;
      }

      if (followersData) {
        console.log('Successfully fetched followers:', followersData);
        setFollowers(followersData);
      }
    } catch (error: any) {
      console.error('Error fetching followers:', error);
      toast({
        title: "Error loading followers",
        description: "Failed to load your followers. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = (follower: Follower) => {
    const { first_name, last_name } = follower.follower_profile;
    if (first_name || last_name) {
      return `${first_name || ''} ${last_name || ''}`.trim();
    }
    return 'Unknown User';
  };

  const getInitials = (follower: Follower) => {
    const { first_name, last_name } = follower.follower_profile;
    return `${first_name?.charAt(0) || ''}${last_name?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center gap-4 p-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
            My Followers
          </h1>
        </div>
        <div className="container mx-auto px-6 py-8 max-w-2xl">
          <div className="text-center">
            <div className="text-lg">Loading followers...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="flex items-center gap-4 p-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
          My Followers
        </h1>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users size={24} />
              Followers ({followers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {followers.length === 0 ? (
              <div className="text-center py-8">
                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  No followers yet
                </p>
                <p className="text-gray-400">
                  Share your events to attract followers!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {followers.map((follower) => (
                  <div 
                    key={follower.id} 
                    className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border-2 border-gray-200">
                        <AvatarImage src={follower.follower_profile.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                          {getInitials(follower)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {getDisplayName(follower)}
                        </h3>
                        {follower.follower_profile.bio && (
                          <p className="text-sm text-gray-600 mt-1">
                            {follower.follower_profile.bio}
                          </p>
                        )}
                      </div>
                    </div>
                    <UserFollowButton 
                      targetUserId={follower.follower_id}
                      targetUserName={getDisplayName(follower)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Followers;
