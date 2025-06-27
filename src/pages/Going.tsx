
import { useState } from 'react';
import TopBar from '@/components/TopBar';
import EventCard from '@/components/EventCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useEvents } from '@/hooks/useEvents';
import { useEventRegistration } from '@/hooks/useEventRegistration';

const Going = () => {
  const { user } = useAuth();
  const { location } = useLocation();
  const { events, setEvents, loading } = useEvents(
    user?.id, 
    [], // No tag filtering
    location || undefined
  );
  
  const { handleJoinEvent, handleLeaveEvent } = useEventRegistration(
    events, 
    setEvents, 
    user?.id
  );

  // Filter events to only show those the user is registered for
  const registeredEvents = events.filter(event => {
    console.log('Event:', event.title, 'is_registered:', event.is_registered);
    return event.is_registered === true;
  });

  console.log('Total events:', events.length, 'Registered events:', registeredEvents.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar showBackButton={true} title="Going" />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="text-center">
            <div className="text-lg">Loading your events...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar showBackButton={true} title="Going" />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Events You're Attending
          </h2>
          <p className="text-gray-600">
            Events you've registered to attend
          </p>
        </div>
        
        <div className="space-y-4">
          {registeredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onJoin={handleJoinEvent}
              onLeave={handleLeaveEvent}
            />
          ))}
        </div>
        
        {registeredEvents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              You haven't registered for any events yet.
            </p>
            <p className="text-gray-400">
              Browse events on the main page to find something interesting!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Going;
