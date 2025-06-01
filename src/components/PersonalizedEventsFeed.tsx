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
}

interface PersonalizedEventsFeedProps {
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

const filterEvents = (events: Event[], filters: EventFilters) => {
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
    
    return true;
  });
};

const PersonalizedEventsFeed = ({ userLocation, filters, selectedTagNames = [] }: PersonalizedEventsFeedProps) => {
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
      fetchPersonalizedEvents();
    }
  }, [user, selectedTagNames]);

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

  const fetchPersonalizedEvents = async () => {
    setLoading(true);
    try {
      console.log('Fetching personalized events based on user interests...');
      
      // First, get user's interests
      const { data: userInterests, error: interestsError } = await supabase
        .from('user_interests')
        .select(`
          activity_tags (
            id,
            name
          )
        `)
        .eq('user_id', user?.id);

      if (interestsError) {
        console.log('Error fetching user interests:', interestsError.message);
        throw interestsError;
      }

      const interestTagIds = userInterests?.map(ui => ui.activity_tags.id) || [];
      
      // Combine user interests with selected filter tags
      let tagFilter: string[] = [];
      if (selectedTagNames.length > 0) {
        // Get tag IDs for selected tag names
        const { data: selectedTagData, error: tagError } = await supabase
          .from('activity_tags')
          .select('id, name')
          .in('name', selectedTagNames);
        
        if (!tagError && selectedTagData) {
          tagFilter = selectedTagData.map(tag => tag.id);
        }
      } else {
        tagFilter = interestTagIds;
      }

      if (tagFilter.length === 0) {
        console.log('No tags to filter by, showing all events');
        // If user has no interests, show all events
        const { data: allEvents, error } = await supabase
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
          `)
          .order('date', { ascending: true });

        if (error) {
          console.log('Database query failed:', error.message);
          throw error;
        }

        if (allEvents && allEvents.length > 0) {
          const eventsData = allEvents.map((event: any) => ({
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
            attendees: event.event_registrations?.length || 0,
            distance: userLocation ? calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              event.latitude ? parseFloat(event.latitude) : undefined,
              event.longitude ? parseFloat(event.longitude) : undefined
            ) : 'Unknown distance',
            activity_tags: event.event_tags?.map((et: any) => et.activity_tags.name) || [],
            is_registered: event.event_registrations?.some((reg: any) => reg.user_id === user?.id) || false
          }));

          const sortedEvents = sortEventsByDateAndDistance(eventsData);
          setEvents(sortedEvents);
        } else {
          setEvents([]);
        }
        return;
      }

      // Fetch events that match the tag filter
      const { data: personalizedEvents, error } = await supabase
        .from('events')
        .select(`
          *,
          event_tags!inner (
            activity_tags (
              name
            )
          ),
          event_registrations (
            id,
            user_id
          )
        `)
        .in('event_tags.tag_id', tagFilter)
        .order('date', { ascending: true });

      if (error) {
        console.log('Database query failed:', error.message);
        throw error;
      }

      if (personalizedEvents && personalizedEvents.length > 0) {
        console.log('Successfully fetched personalized events from database');
        
        const eventsData = personalizedEvents.map((event: any) => ({
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
          attendees: event.event_registrations?.length || 0,
          distance: userLocation ? calculateDistance(
            userLocation.lat, 
            userLocation.lng, 
            event.latitude ? parseFloat(event.latitude) : undefined,
            event.longitude ? parseFloat(event.longitude) : undefined
          ) : 'Unknown distance',
          activity_tags: event.event_tags?.map((et: any) => et.activity_tags.name) || [],
          is_registered: event.event_registrations?.some((reg: any) => reg.user_id === user?.id) || false
        }));

        // Sort events by date first, then by distance
        const sortedEvents = sortEventsByDateAndDistance(eventsData);
        setEvents(sortedEvents);
      } else {
        console.log('No personalized events found');
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Error fetching personalized events:', error);
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
        fetchPersonalizedEvents();
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
        fetchPersonalizedEvents();
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
  const filteredEvents = filterEvents(events, currentFilters);
  const sortedEvents = sortEventsByDateAndDistance(filteredEvents);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="text-lg">Loading personalized events...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          For You
        </h2>
        <p className="text-gray-600">
          Events matched to your interests
        </p>
      </div>
      
      <div className="space-y-4">
        {sortedEvents.map((event) => (
          <EventCard 
            key={event.id} 
            event={event} 
            onJoin={handleJoinEvent}
            onLeave={handleLeaveEvent}
          />
        ))}
      </div>
      
      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No personalized events found matching your filters.
          </p>
          <p className="text-gray-400">
            Try adjusting your filters or set your interests in your profile!
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalizedEventsFeed;
