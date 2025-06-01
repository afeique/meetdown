
import EventCard from './EventCard';
import { EventFilters } from './EventFilters';
import { useAuth } from '@/contexts/AuthContext';
import { usePersonalizedEvents } from '@/hooks/usePersonalizedEvents';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { filterEvents, getDefaultFilters } from '@/utils/eventFilters';
import { sortEventsByDateAndDistance } from '@/utils/eventUtils';

interface PersonalizedEventsFeedProps {
  userLocation?: { lat: number; lng: number };
  filters?: EventFilters;
  selectedTagNames?: string[];
}

const PersonalizedEventsFeed = ({ 
  userLocation, 
  filters, 
  selectedTagNames = [] 
}: PersonalizedEventsFeedProps) => {
  const { user } = useAuth();
  const { events, setEvents, loading } = usePersonalizedEvents(
    user?.id, 
    selectedTagNames, 
    userLocation
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
