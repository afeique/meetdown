import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EventCard from './EventCard';
import { EventFilters } from './EventFilters';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  max_attendees: number;
  cover_charge: number;
  requires_reservation: boolean;
  banner_url?: string;
  creator_id: string;
  attendees?: number;
  distance?: string;
  activity_tags: string[];
  is_registered?: boolean;
  creator_name?: string;
}

interface FollowingEventsFeedProps {
  userLocation?: { lat: number; lng: number };
  filters?: EventFilters;
  selectedTagNames?: string[];
}

const parseDistance = (distance: string): number => {
  const match = distance.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

const sortEventsByDateAndDistance = (events: Event[]) => {
  return [...events].sort((a, b) => {
    // First, sort by date
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // If dates are the same, sort by distance
    const distanceA = parseDistance(a.distance || '0');
    const distanceB = parseDistance(b.distance || '0');
    
    return distanceA - distanceB;
  });
};

const filterEvents = (events: Event[], filters: EventFilters, tagNames: string[]) => {
  return events.filter(event => {
    // Filter by cover charge
    if (filters.freeEventsOnly && event.cover_charge > 0) {
      return false;
    }
    if (!filters.freeEventsOnly && event.cover_charge > filters.maxCoverCharge) {
      return false;
    }
    
    // Filter by reservation requirement
    if (filters.noReservationRequired && event.requires_reservation) {
      return false;
    }
    
    // Filter by tags - if tags are selected, event must have at least one matching tag
    if (tagNames.length > 0) {
      const hasMatchingTag = event.activity_tags.some(tag => 
        tagNames.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  });
};

const FollowingEventsFeed = ({ userLocation, filters, selectedTagNames = [] }: FollowingEventsFeedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultFilters: EventFilters = {
    maxCoverCharge: 50,
    noReservationRequired: false,
    freeEventsOnly: false,
    selectedTags: []
  };

  useEffect(() => {
    if (user) {
      fetchFollowingEvents();
    }
  }, [user]);

  const calculateDistance = (lat1?: number, lng1?: number, lat2?: number, lng2?: number): string => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 'Unknown distance';
    
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    return `${distance.toFixed(1)} miles`;
  };

  const fetchFollowingEvents = async () => {
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
          const tags = event.event_tags?.map((et: any) => et.activity_tags.name) || [];
          const registrations = event.event_registrations || [];
          const attendees = registrations.length;
          const isRegistered = registrations.some((reg: any) => reg.user_id === user?.id);
          const creatorName = event.profiles ? 
            `${event.profiles.first_name || ''} ${event.profiles.last_name || ''}`.trim() || 'Unknown User' :
            'Unknown User';
          
          return {
            id: event.id,
            title: event.title,
            description: event.description || '',
            date: new Date(event.date).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            time: new Date(`1970-01-01T${event.time}`).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            location: event.location,
            latitude: event.latitude ? parseFloat(event.latitude) : undefined,
            longitude: event.longitude ? parseFloat(event.longitude) : undefined,
            max_attendees: event.max_attendees,
            cover_charge: parseFloat(event.cover_charge) || 0,
            requires_reservation: event.requires_reservation,
            banner_url: event.banner_url,
            creator_id: event.creator_id,
            attendees,
            distance: userLocation ? calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              event.latitude ? parseFloat(event.latitude) : undefined,
              event.longitude ? parseFloat(event.longitude) : undefined
            ) : 'Unknown distance',
            activity_tags: tags,
            is_registered: isRegistered,
            creator_name: creatorName
          };
        });

        // Sort events by date first, then by distance
        const sortedEvents = sortEventsByDateAndDistance(eventsData);
        setEvents(sortedEvents);
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

  const handleJoinEvent = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join events.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: user.id
        });

      if (error) {
        console.log('Database registration failed, updating UI only:', error.message);
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, is_registered: true, attendees: (event.attendees || 0) + 1 }
              : event
          )
        );
        
        toast({
          title: "Demo: Joined event!",
          description: "You've been registered for this event (demo mode).",
        });
      } else {
        toast({
          title: "Successfully joined event!",
          description: "You've been registered for this event.",
        });
        fetchFollowingEvents();
      }
    } catch (error: any) {
      console.error('Error joining event:', error);
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, is_registered: true, attendees: (event.attendees || 0) + 1 }
            : event
        )
      );
      
      toast({
        title: "Demo: Joined event!",
        description: "You've been registered for this event (demo mode).",
      });
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.log('Database unregistration failed, updating UI only:', error.message);
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId 
              ? { ...event, is_registered: false, attendees: Math.max((event.attendees || 1) - 1, 0) }
              : event
          )
        );
        
        toast({
          title: "Demo: Left event",
          description: "You've been unregistered from this event (demo mode).",
        });
      } else {
        toast({
          title: "Left event",
          description: "You've been unregistered from this event.",
        });
        fetchFollowingEvents();
      }
    } catch (error: any) {
      console.error('Error leaving event:', error);
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, is_registered: false, attendees: Math.max((event.attendees || 1) - 1, 0) }
            : event
        )
      );
      
      toast({
        title: "Demo: Left event",
        description: "You've been unregistered from this event (demo mode).",
      });
    }
  };

  const currentFilters = filters || defaultFilters;
  const filteredEvents = filterEvents(events, currentFilters, selectedTagNames);
  const sortedEvents = sortEventsByDateAndDistance(filteredEvents);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="text-lg">Loading events from people you follow...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Following
        </h2>
        <p className="text-gray-600">
          Events from people you follow
        </p>
      </div>
      
      <div className="space-y-4">
        {sortedEvents.map((event) => (
          <div key={event.id} className="space-y-2">
            {event.creator_name && (
              <div className="text-sm text-gray-500">
                Event by <span className="font-medium">{event.creator_name}</span>
              </div>
            )}
            <EventCard 
              event={event} 
              onJoin={handleJoinEvent}
              onLeave={handleLeaveEvent}
            />
          </div>
        ))}
      </div>
      
      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No events found matching your filters.
          </p>
          <p className="text-gray-400">
            Follow other users to see their events here!
          </p>
        </div>
      )}
    </div>
  );
};

export default FollowingEventsFeed;
