
import EventCard from './EventCard';
import { EventFilters } from './EventFilters';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useEvents } from '@/hooks/useEvents';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { filterEvents, getDefaultFilters } from '@/utils/eventFilters';
import { sortEventsByDateAndDistance } from '@/utils/eventUtils';

interface EventsFeedProps {
  filters?: EventFilters;
  selectedTagNames?: string[];
}

const EventsFeed = ({ filters, selectedTagNames = [] }: EventsFeedProps) => {
  const { user } = useAuth();
  const { location } = useLocation();
  const { events, setEvents, loading } = useEvents(
    user?.id, 
    selectedTagNames, 
    location || undefined
  );
  
  const { handleJoinEvent, handleLeaveEvent } = useEventRegistration(
    events, 
    setEvents, 
    user?.id
  );

  const currentFilters = filters || getDefaultFilters();
  const filteredEvents = filterEvents(events, currentFilters);
  const sortedEvents = sortEventsByDateAndDistance(filteredEvents);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center">
          <div className="text-lg">Loading nearby events...</div>
        </div>
      </div>
    );
  }

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
            No events found matching your filters.
          </p>
          <p className="text-gray-400">
            Try adjusting your search criteria or create a new event!
          </p>
        </div>
      )}
    </div>
  );
};

export default EventsFeed;
