
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';

interface UserFollowButtonProps {
  targetUserId: string;
  targetUserName?: string;
}

const UserFollowButton = ({ targetUserId, targetUserName }: UserFollowButtonProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && targetUserId && user.id !== targetUserId) {
      checkFollowStatus();
    }
  }, [user, targetUserId]);

  const checkFollowStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_id', user?.id)
        .eq('following_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return;
      }

      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow users.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;

        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${targetUserName || 'this user'}.`,
        });
      } else {
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;

        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You are now following ${targetUserName || 'this user'}.`,
        });
      }
    } catch (error: any) {
      console.error('Error updating follow status:', error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if user is viewing their own profile
  if (!user || user.id === targetUserId) {
    return null;
  }

  return (
    <Button
      onClick={handleFollow}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className="flex items-center gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus size={16} />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus size={16} />
          Follow
        </>
      )}
    </Button>
  );
};

export default UserFollowButton;
