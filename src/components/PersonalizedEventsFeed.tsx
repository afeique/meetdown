
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EventCard from './EventCard';
import EventFiltersComponent, { EventFilters } from './EventFilters';

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
  creator_id: string;
  attendees?: number;
  distance?: string;
  activity_tags: string[];
  is_registered?: boolean;
}

interface PersonalizedEventsFeedProps {
  userLocation?: { lat: number; lng: number };
}

const PersonalizedEventsFeed = ({ userLocation }: PersonalizedEventsFeedProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [filters, setFilters] = useState<EventFilters>({
    maxCoverCharge: 50,
    noReservationRequired: false,
    freeEventsOnly: false
  });

  useEffect(() => {
    if (user) {
      fetchUserInterests();
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [userInterests, userLocation, filters]);

  const fetchUserInterests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_interests')
        .select(`
          activity_tags (
            name
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;

      const interests = data?.map(item => item.activity_tags.name) || [];
      setUserInterests(interests);
    } catch (error: any) {
      console.error('Error fetching user interests:', error);
    }
  };

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

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Fetch events with tags and registration counts
      const { data: eventsData, error: eventsError } = await supabase
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
          )
        `);

      if (eventsError) throw eventsError;

      // Transform the data to match our Event interface
      const transformedEvents: Event[] = (eventsData || []).map(event => {
        const tags = event.event_tags?.map((et: any) => et.activity_tags.name) || [];
        const registrations = event.event_registrations || [];
        const attendees = registrations.length;
        const isRegistered = registrations.some((reg: any) => reg.user_id === user?.id);
        
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
          creator_id: event.creator_id,
          attendees,
          distance: userLocation ? calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            event.latitude ? parseFloat(event.latitude) : undefined,
            event.longitude ? parseFloat(event.longitude) : undefined
          ) : 'Unknown distance',
          activity_tags: tags,
          is_registered: isRegistered
        };
      });

      // Apply filters
      let filteredEvents = transformedEvents.filter(event => {
        if (filters.freeEventsOnly && event.cover_charge > 0) return false;
        if (!filters.freeEventsOnly && event.cover_charge > filters.maxCoverCharge) return false;
        if (filters.noReservationRequired && event.requires_reservation) return false;
        return true;
      });

      // Sort by personalization if user has interests
      if (userInterests.length > 0) {
        filteredEvents = filteredEvents.filter(event => 
          event.activity_tags.some(tag => userInterests.includes(tag))
        );

        filteredEvents.sort((a, b) => {
          const aMatches = a.activity_tags.filter(tag => userInterests.includes(tag)).length;
          const bMatches = b.activity_tags.filter(tag => userInterests.includes(tag)).length;
          return bMatches - aMatches;
        });
      }

      setEvents(filteredEvents);
    } catch (error: any) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive",
      });
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

      if (error) throw error;

      toast({
        title: "Successfully joined event!",
        description: "You've been registered for this event.",
      });

      // Refresh events to update registration status
      fetchEvents();
    } catch (error: any) {
      console.error('Error joining event:', error);
      toast({
        title: "Error joining event",
        description: error.message,
        variant: "destructive",
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

      if (error) throw error;

      toast({
        title: "Left event",
        description: "You've been unregistered from this event.",
      });

      // Refresh events to update registration status
      fetchEvents();
    } catch (error: any) {
      console.error('Error leaving event:', error);
      toast({
        title: "Error leaving event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="text-center">
          <div className="text-lg">Loading personalized events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {userInterests.length > 0 ? 'Events For You' : 'Nearby Events'}
        </h2>
        <p className="text-gray-600">
          {userInterests.length > 0 
            ? 'Discover events matching your interests' 
            : 'Discover and join events happening near you'
          }
        </p>
        {userInterests.length > 0 && (
          <p className="text-sm text-blue-600 mt-1">
            Based on your interests: {userInterests.join(', ')}
          </p>
        )}
      </div>

      <EventFiltersComponent filters={filters} onFiltersChange={setFilters} />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onJoin={handleJoinEvent}
            onLeave={handleLeaveEvent}
          />
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No events found matching your criteria.
          </p>
          <p className="text-gray-400">
            Try adjusting your filters or check back later for new events!
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalizedEventsFeed;
