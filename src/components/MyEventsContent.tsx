
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/EventCard';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/utils/eventFilters';

interface MyEventsContentProps {
  events: Event[];
  setEvents: (events: Event[]) => void;
  pastEvents: Event[];
  upcomingEvents: Event[];
  onEdit: (event: Event) => void;
  onDelete: (eventId: string) => void;
}

const MyEventsContent = ({ 
  events, 
  setEvents, 
  pastEvents, 
  upcomingEvents, 
  onEdit, 
  onDelete 
}: MyEventsContentProps) => {
  const { user } = useAuth();
  const { handleJoinEvent, handleLeaveEvent } = useEventRegistration(
    events, 
    setEvents, 
    user?.id
  );

  return (
    <div className="space-y-8">
      {/* Upcoming Events Section */}
      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Events ({upcomingEvents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="relative">
                <EventCard
                  event={event}
                  onJoin={handleJoinEvent}
                  onLeave={handleLeaveEvent}
                />
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(event)}
                    className="opacity-80 hover:opacity-100"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(event.id)}
                    className="opacity-80 hover:opacity-100"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Events Section */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Past Events ({pastEvents.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div key={event.id} className="relative">
                <EventCard
                  event={event}
                  onJoin={handleJoinEvent}
                  onLeave={handleLeaveEvent}
                />
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(event)}
                    className="opacity-80 hover:opacity-100"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(event.id)}
                    className="opacity-80 hover:opacity-100"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyEventsContent;
