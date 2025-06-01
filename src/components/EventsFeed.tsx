
import EventCard from './EventCard';
import { EventFilters } from './EventFilters';

// Mock data for demonstration with banner photos
const mockEvents = [
  {
    id: '1',
    title: 'Coffee & Code Meetup',
    description: 'Join us for a casual coding session with coffee and great conversations.',
    date: 'June 15, 2024',
    time: '10:00 AM',
    location: 'Central Coffee House, Downtown',
    attendees: 8,
    max_attendees: 15,
    distance: '0.5 miles',
    cover_charge: 0,
    requires_reservation: false,
    activity_tags: ['Coffee', 'Tech', 'Networking'],
    is_registered: false,
    creator_id: 'mock-user-1',
    banner_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: '2',
    title: 'Weekend Hiking Adventure',
    description: 'Explore beautiful trails and enjoy nature with fellow hiking enthusiasts.',
    date: 'June 17, 2024',
    time: '8:00 AM',
    location: 'Mountain View Trail Head',
    attendees: 12,
    max_attendees: 20,
    distance: '2.3 miles',
    cover_charge: 5,
    requires_reservation: true,
    activity_tags: ['Hiking', 'Sports', 'Fitness'],
    is_registered: false,
    creator_id: 'mock-user-2',
    banner_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: '3',
    title: 'Board Game Night',
    description: 'Fun evening of board games, snacks, and making new friends.',
    date: 'June 18, 2024',
    time: '7:00 PM',
    location: 'Game Lounge, Main Street',
    attendees: 6,
    max_attendees: 12,
    distance: '1.1 miles',
    cover_charge: 10,
    requires_reservation: false,
    activity_tags: ['Gaming', 'Entertainment'],
    is_registered: true,
    creator_id: 'mock-user-3',
    banner_url: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  },
  {
    id: '4',
    title: 'Photography Walk',
    description: 'Capture the beauty of the city while meeting other photography enthusiasts.',
    date: 'June 20, 2024',
    time: '6:00 PM',
    location: 'City Park & Gardens',
    attendees: 4,
    max_attendees: 10,
    distance: '0.8 miles',
    cover_charge: 0,
    requires_reservation: false,
    activity_tags: ['Photography', 'Art'],
    is_registered: false,
    creator_id: 'mock-user-4',
    banner_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
  }
];

const parseDistance = (distance: string): number => {
  const match = distance.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

const sortEventsByDateAndDistance = (events: typeof mockEvents) => {
  return [...events].sort((a, b) => {
    // First, sort by date
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // If dates are the same, sort by distance
    const distanceA = parseDistance(a.distance);
    const distanceB = parseDistance(b.distance);
    
    return distanceA - distanceB;
  });
};

const filterEvents = (events: typeof mockEvents, filters: EventFilters, tagNames: string[]) => {
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

interface EventsFeedProps {
  filters?: EventFilters;
  selectedTagNames?: string[];
}

const EventsFeed = ({ filters, selectedTagNames = [] }: EventsFeedProps) => {
  const defaultFilters: EventFilters = {
    maxCoverCharge: 50,
    noReservationRequired: false,
    freeEventsOnly: false,
    selectedTags: []
  };
  
  const currentFilters = filters || defaultFilters;
  const filteredEvents = filterEvents(mockEvents, currentFilters, selectedTagNames);
  const sortedEvents = sortEventsByDateAndDistance(filteredEvents);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Nearby Events
        </h2>
        <p className="text-gray-600">
          Discover and join events happening near you
        </p>
      </div>
      
      <div className="space-y-4">
        {sortedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No events found matching your filters. Try adjusting your search criteria!
          </p>
        </div>
      )}
    </div>
  );
};

export default EventsFeed;
