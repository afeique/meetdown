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

// Fallback mock data that matches the Event interface
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Coffee & Code Meetup',
    description: 'Join us for a casual coding session with coffee and great conversations.',
    date: 'June 15, 2024',
    time: '10:00 AM',
    location: 'Central Coffee House, Downtown',
    latitude: 37.7749,
    longitude: -122.4194,
    max_attendees: 15,
    cover_charge: 0,
    requires_reservation: false,
    creator_id: 'mock-user-1',
    attendees: 8,
    distance: '0.5 miles',
    activity_tags: ['Coffee', 'Tech', 'Networking'],
    is_registered: false
  },
  {
    id: '2',
    title: 'Weekend Hiking Adventure',
    description: 'Explore beautiful trails and enjoy nature with fellow hiking enthusiasts.',
    date: 'June 17, 2024',
    time: '8:00 AM',
    location: 'Mountain View Trail Head',
    latitude: 37.7849,
    longitude: -122.4094,
    max_attendees: 20,
    cover_charge: 5,
    requires_reservation: true,
    creator_id: 'mock-user-2',
    attendees: 12,
    distance: '2.3 miles',
    activity_tags: ['Hiking', 'Sports', 'Fitness'],
    is_registered: false
  },
  {
    id: '3',
    title: 'Board Game Night',
    description: 'Fun evening of board games, snacks, and making new friends.',
    date: 'June 18, 2024',
    time: '7:00 PM',
    location: 'Game Lounge, Main Street',
    latitude: 37.7649,
    longitude: -122.4294,
    max_attendees: 12,
    cover_charge: 10,
    requires_reservation: false,
    creator_id: 'mock-user-3',
    attendees: 6,
    distance: '1.1 miles',
    activity_tags: ['Gaming', 'Entertainment'],
    is_registered: true
  },
  {
    id: '4',
    title: 'Photography Walk',
    description: 'Capture the beauty of the city while meeting other photography enthusiasts.',
    date: 'June 20, 2024',
    time: '6:00 PM',
    location: 'City Park & Gardens',
    latitude: 37.7549,
    longitude: -122.4394,
    max_attendees: 10,
    cover_charge: 0,
    requires_reservation: false,
    creator_id: 'mock-user-4',
    attendees: 4,
    distance: '0.8 miles',
    activity_tags: ['Photography', 'Art'],
    is_registered: false
  },
  {
    id: '5',
    title: 'Yoga in the Park',
    description: 'Start your morning with a peaceful yoga session in nature.',
    date: 'June 21, 2024',
    time: '7:00 AM',
    location: 'Riverside Park',
    latitude: 37.7749,
    longitude: -122.4494,
    max_attendees: 25,
    cover_charge: 15,
    requires_reservation: true,
    creator_id: 'mock-user-5',
    attendees: 18,
    distance: '1.5 miles',
    activity_tags: ['Yoga', 'Fitness', 'Sports'],
    is_registered: false
  },
  {
    id: '6',
    title: 'Local Music Jam Session',
    description: 'Musicians of all levels welcome to jam and share music.',
    date: 'June 22, 2024',
    time: '8:00 PM',
    location: 'Community Center',
    latitude: 37.7949,
    longitude: -122.4194,
    max_attendees: 15,
    cover_charge: 0,
    requires_reservation: false,
    creator_id: 'mock-user-6',
    attendees: 10,
    distance: '0.7 miles',
    activity_tags: ['Music'],
    is_registered: false
  }
];

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
      // Continue with empty interests if there's an error
      setUserInterests([]);
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
      // Try to fetch from database first, fall back to mock data if events table doesn't exist
      let eventsData = mockEvents;
      
      try {
        console.log('Attempting to fetch events from database...');
        // This will fail if the events table doesn't exist yet
        const { data: dbEvents, error: eventsError } = await supabase
          .from('events' as any) // Type assertion to bypass TypeScript error
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

        if (eventsError) {
          console.log('Database query failed, using mock data:', eventsError.message);
          throw eventsError;
        }

        if (dbEvents && dbEvents.length > 0) {
          console.log('Successfully fetched events from database');
          // Transform database events to match our Event interface
          eventsData = dbEvents.map((event: any) => {
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
        }
      } catch (dbError) {
        console.log('Using mock data due to database error:', dbError);
        // Update mock data distances if user location is available
        if (userLocation) {
          eventsData = mockEvents.map(event => ({
            ...event,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              event.latitude,
              event.longitude
            )
          }));
        }
      }

      // Apply filters
      let filteredEvents = eventsData.filter(event => {
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
      console.error('Error in fetchEvents:', error);
      toast({
        title: "Using demo events",
        description: "Database not fully configured yet, showing sample events.",
        variant: "default",
      });
      
      // Apply filters to mock data as fallback
      let filteredMockEvents = mockEvents.filter(event => {
        if (filters.freeEventsOnly && event.cover_charge > 0) return false;
        if (!filters.freeEventsOnly && event.cover_charge > filters.maxCoverCharge) return false;
        if (filters.noReservationRequired && event.requires_reservation) return false;
        return true;
      });

      setEvents(filteredMockEvents);
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
      // Try to insert into database, but handle gracefully if table doesn't exist
      const { error } = await supabase
        .from('event_registrations' as any)
        .insert({
          event_id: eventId,
          user_id: user.id
        });

      if (error) {
        console.log('Database registration failed, updating UI only:', error.message);
        // Update local state for demo purposes
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
        // Refresh events to update registration status
        fetchEvents();
      }
    } catch (error: any) {
      console.error('Error joining event:', error);
      // Update local state for demo purposes
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
      // Try to delete from database, but handle gracefully if table doesn't exist
      const { error } = await supabase
        .from('event_registrations' as any)
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.log('Database unregistration failed, updating UI only:', error.message);
        // Update local state for demo purposes
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
        // Refresh events to update registration status
        fetchEvents();
      }
    } catch (error: any) {
      console.error('Error leaving event:', error);
      // Update local state for demo purposes
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
      
      <div className="space-y-4">
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
