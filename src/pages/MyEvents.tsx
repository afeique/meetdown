
import MyEventsHeader from '@/components/MyEventsHeader';
import MyEventsCreateForm from '@/components/MyEventsCreateForm';
import MyEventsEmptyState from '@/components/MyEventsEmptyState';
import EventEditForm from '@/components/EventEditForm';
import { useMyEvents } from '@/hooks/useMyEvents';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/EventCard';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import { useAuth } from '@/contexts/AuthContext';

const MyEvents = () => {
  const { user } = useAuth();
  const {
    events,
    setEvents,
    recentPastEvents,
    setRecentPastEvents,
    loading,
    editingEvent,
    handleDeleteEvent,
    handleEditEvent,
    handleEventUpdated,
    handleCancelEdit
  } = useMyEvents();

  const { handleJoinEvent, handleLeaveEvent } = useEventRegistration(
    events, 
    setEvents, 
    user?.id
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MyEventsHeader />

      <div className="container mx-auto px-4 py-6">
        {editingEvent ? (
          <div className="mb-6">
            <EventEditForm
              event={editingEvent}
              onEventUpdated={handleEventUpdated}
              onCancel={handleCancelEdit}
            />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <MyEventsCreateForm onEventCreated={() => window.location.reload()} />
            </div>

            {events.length === 0 && recentPastEvents.length === 0 ? (
              <MyEventsEmptyState />
            ) : (
              <div className="space-y-8">
                {/* Upcoming Events Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events ({events.length})
                  </h2>
                  {events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {events.map((event) => (
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
                              onClick={() => handleEditEvent(event)}
                              className="opacity-80 hover:opacity-100"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
                              className="opacity-80 hover:opacity-100"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No upcoming events</p>
                  )}
                </div>

                {/* Recent Past Events Section */}
                {recentPastEvents.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Recent Past Events ({recentPastEvents.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recentPastEvents.map((event) => (
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
                              onClick={() => handleEditEvent(event)}
                              className="opacity-80 hover:opacity-100"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteEvent(event.id)}
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
