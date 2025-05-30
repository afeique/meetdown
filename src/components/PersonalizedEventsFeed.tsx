
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import EventCard from './EventCard';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  distance: string;
  latitude?: number;
  longitude?: number;
  creator_id: string;
  activity_tags: string[];
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

  useEffect(() => {
    if (user) {
      fetchUserInterests();
    }
  }, [user]);

  useEffect(() => {
    if (userInterests.length > 0) {
      fetchPersonalizedEvents();
    } else {
      fetchAllEvents();
    }
  }, [userInterests, userLocation]);

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

  const fetchPersonalizedEvents = async () => {
    setLoading(true);
    try {
      // For now, we'll use mock data but filter based on user interests
      // In a real app, this would query a real events table
      const mockEvents = getMockEvents();
      
      // Filter events based on user interests
      const personalizedEvents = mockEvents.filter(event => 
        event.activity_tags.some(tag => userInterests.includes(tag))
      );

      // Sort by relevance (events matching more interests first)
      personalizedEvents.sort((a, b) => {
        const aMatches = a.activity_tags.filter(tag => userInterests.includes(tag)).length;
        const bMatches = b.activity_tags.filter(tag => userInterests.includes(tag)).length;
        return bMatches - aMatches;
      });

      setEvents(personalizedEvents);
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      // Show all events if user has no interests set
      const mockEvents = getMockEvents();
      setEvents(mockEvents);
    } catch (error: any) {
      toast({
        title: "Error loading events",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMockEvents = (): Event[] => [
    {
      id: '1',
      title: 'Coffee & Code Meetup',
      description: 'Join us for a casual coding session with coffee and great conversations.',
      date: 'June 15, 2024',
      time: '10:00 AM',
      location: 'Central Coffee House, Downtown',
      attendees: 8,
      maxAttendees: 15,
      distance: '0.5 miles',
      creator_id: 'mock-user-1',
      activity_tags: ['Coffee', 'Tech', 'Networking']
    },
    {
      id: '2',
      title: 'Weekend Hiking Adventure',
      description: 'Explore beautiful trails and enjoy nature with fellow hiking enthusiasts.',
      date: 'June 17, 2024',
      time: '8:00 AM',
      location: 'Mountain View Trail Head',
      attendees: 12,
      maxAttendees: 20,
      distance: '2.3 miles',
      creator_id: 'mock-user-2',
      activity_tags: ['Hiking', 'Sports', 'Fitness']
    },
    {
      id: '3',
      title: 'Board Game Night',
      description: 'Fun evening of board games, snacks, and making new friends.',
      date: 'June 18, 2024',
      time: '7:00 PM',
      location: 'Game Lounge, Main Street',
      attendees: 6,
      maxAttendees: 12,
      distance: '1.1 miles',
      creator_id: 'mock-user-3',
      activity_tags: ['Gaming', 'Entertainment']
    },
    {
      id: '4',
      title: 'Photography Walk',
      description: 'Capture the beauty of the city while meeting other photography enthusiasts.',
      date: 'June 20, 2024',
      time: '6:00 PM',
      location: 'City Park & Gardens',
      attendees: 4,
      maxAttendees: 10,
      distance: '0.8 miles',
      creator_id: 'mock-user-4',
      activity_tags: ['Photography', 'Art', 'Creative']
    },
    {
      id: '5',
      title: 'Yoga in the Park',
      description: 'Start your morning with a peaceful yoga session in nature.',
      date: 'June 21, 2024',
      time: '7:00 AM',
      location: 'Riverside Park',
      attendees: 15,
      maxAttendees: 25,
      distance: '1.5 miles',
      creator_id: 'mock-user-5',
      activity_tags: ['Yoga', 'Fitness', 'Sports']
    },
    {
      id: '6',
      title: 'Local Music Jam Session',
      description: 'Musicians of all levels welcome to jam and share music.',
      date: 'June 22, 2024',
      time: '8:00 PM',
      location: 'Community Center',
      attendees: 7,
      maxAttendees: 15,
      distance: '0.9 miles',
      creator_id: 'mock-user-6',
      activity_tags: ['Music', 'Creative']
    }
  ];

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
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">
            No events found matching your interests.
          </p>
          <p className="text-gray-400">
            Try updating your interests in your profile or check back later for new events!
          </p>
        </div>
      )}
    </div>
  );
};

export default PersonalizedEventsFeed;
