
import { calculateDistance } from './eventUtils';
import { Event } from './eventFilters';

export const transformEventData = (
  event: any, 
  userLocation?: { lat: number; lng: number },
  userId?: string
): Event => {
  // Get user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Create a date object for formatting
  const eventDate = new Date(event.date);
  const eventDateTime = new Date(`${event.date}T${event.time}`);
  
  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    date: eventDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    time: eventDateTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }),
    location: event.location,
    latitude: event.latitude ? parseFloat(event.latitude) : undefined,
    longitude: event.longitude ? parseFloat(event.longitude) : undefined,
    max_attendees: event.max_attendees,
    cover_charge: parseFloat(event.cover_charge) || 0,
    requires_reservation: event.requires_reservation,
    banner_url: event.banner_url,
    creator_id: event.creator_id,
    attendees: event.event_registrations?.length || 0,
    distance: userLocation ? calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      event.latitude ? parseFloat(event.latitude) : undefined,
      event.longitude ? parseFloat(event.longitude) : undefined
    ) : 'Unknown distance',
    activity_tags: event.event_tags?.map((et: any) => et.activity_tags.name) || [],
    is_registered: event.event_registrations?.some((reg: any) => reg.user_id === userId) || false
  };
};
