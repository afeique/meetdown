
import { calculateDistance } from './eventUtils';
import { Event } from './eventFilters';

interface DateTimePreferences {
  dateFormat: 'month-day' | 'full-date' | 'short-date';
  timeFormat: '12-hour' | '24-hour';
  showTimezone: boolean;
}

export const transformEventData = (
  event: any, 
  userLocation?: { lat: number; lng: number },
  userId?: string,
  dateTimePrefs?: DateTimePreferences
): Event => {
  // Default preferences if not provided
  const prefs: DateTimePreferences = dateTimePrefs || {
    dateFormat: 'month-day',
    timeFormat: '12-hour',
    showTimezone: true
  };
  
  // Create a date object for formatting
  const eventDate = new Date(event.date);
  const eventDateTime = new Date(`${event.date}T${event.time}`);
  
  // Format date based on preferences
  let formattedDate: string;
  switch (prefs.dateFormat) {
    case 'month-day':
      formattedDate = eventDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
      break;
    case 'short-date':
      formattedDate = eventDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      break;
    case 'full-date':
    default:
      formattedDate = eventDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
      break;
  }
  
  // Format time based on preferences
  let formattedTime: string;
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };
  
  if (prefs.timeFormat === '12-hour') {
    timeOptions.hour12 = true;
  } else {
    timeOptions.hour12 = false;
  }
  
  if (prefs.showTimezone) {
    timeOptions.timeZoneName = 'short';
  }
  
  formattedTime = eventDateTime.toLocaleTimeString('en-US', timeOptions);
  
  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    date: formattedDate,
    time: formattedTime,
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
