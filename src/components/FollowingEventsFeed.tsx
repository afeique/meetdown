
import EventCard from './EventCard';
import { EventFilters } from './EventFilters';
import { useFollowingEvents } from '@/hooks/useFollowingEvents';
import { useFollowingEventRegistration } from '@/hooks/useFollowingEventRegistration';
import { filterFollowingEvents } from '@/utils/followingEventsUtils';
import { sortEventsByDateAndDistance } from '@/utils/eventUtils';

interface FollowingEventsFeedProps {
  userLocation?: { lat: number; lng: number };
  filters?: EventFilters;
  selectedTagNames?: string[];
}

const FollowingEventsFeed = ({ userLocation, filters, selectedTagNames = [] }: FollowingEventsFeedProps) => {
  const { events, setEvents, loading, refetch } = useFollowingEvents(userLocation);
  
  const { handleJoinEvent, handleLeaveEvent } = useFollowingEventRegistration(
    events, 
    setEvents, 
    refetch
  );

  const defaultFilters: EventFilters = {
    maxCoverCharge: 50,
    noReservationRequired: false,
    freeEventsOnly: false,
    selectedTags: []
  };

  const currentFilters = filters || defaultFilters;
  const filteredEvents = filterFollowingEvents(events, currentFilters, selectedTagNames);
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
