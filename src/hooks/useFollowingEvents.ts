
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { transformEventData } from '@/utils/eventDataTransform';
import { Event } from '@/utils/eventFilters';

interface FollowingEvent extends Event {
  creator_name?: string;
}

export const useFollowingEvents = (
  userLocation?: { lat: number; lng: number }
) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<FollowingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFollowingEvents = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log('Fetching events from users that current user follows...');
      
      // First, get the list of users that the current user follows
      const { data: followingUsers, error: followingError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user?.id);

      if (followingError) {
        console.log('Error fetching following users:', followingError.message);
        throw followingError;
      }

      if (!followingUsers || followingUsers.length === 0) {
        console.log('User is not following anyone');
        setEvents([]);
        return;
      }

      const followingIds = followingUsers.map(f => f.following_id);

      // Then fetch events created by those users
      const { data: followingEvents, error } = await supabase
        .from('events')
        .select(`
          *,
          event_tags (
            activity_tags (
              name
            )
          ),
          event_registrations (
            id,
            user_id
          ),
          profiles!events_creator_id_fkey (
            first_name,
            last_name
          )
        `)
        .in('creator_id', followingIds)
        .order('date', { ascending: true });

      if (error) {
        console.log('Database query failed:', error.message);
        throw error;
      }

      if (followingEvents && followingEvents.length > 0) {
        console.log('Successfully fetched following events from database');
        
        const eventsData = followingEvents.map((event: any) => {
          const baseEvent = transformEventData(event, userLocation, user?.id);
          const creatorName = event.profiles ? 
            `${event.profiles.first_name || ''} ${event.profiles.last_name || ''}`.trim() || 'Unknown User' :
            'Unknown User';
          
          return {
            ...baseEvent,
            creator_name: creatorName
          };
        });

        setEvents(eventsData);
      } else {
        console.log('No events found from followed users');
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Error fetching following events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFollowingEvents();
    }
  }, [user]);

  return { events, setEvents, loading, refetch: fetchFollowingEvents };
};
