
import MyEventsHeader from '@/components/MyEventsHeader';
import MyEventsCreateForm from '@/components/MyEventsCreateForm';
import MyEventsEmptyState from '@/components/MyEventsEmptyState';
import MyEventsContent from '@/components/MyEventsContent';
import EventEditForm from '@/components/EventEditForm';
import { useMyEvents } from '@/hooks/useMyEvents';

const MyEvents = () => {
  const {
    events,
    setEvents,
    loading,
    editingEvent,
    separateEvents,
    handleDeleteEvent,
    handleEditEvent,
    handleEventUpdated,
    handleCancelEdit
  } = useMyEvents();

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

  const { pastEvents, upcomingEvents } = separateEvents(events);

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

            {events.length === 0 ? (
              <MyEventsEmptyState />
            ) : (
              <MyEventsContent
                events={events}
                setEvents={setEvents}
                pastEvents={pastEvents}
                upcomingEvents={upcomingEvents}
                onEdit={handleEditEvent}
                onDelete={handleDeleteEvent}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
