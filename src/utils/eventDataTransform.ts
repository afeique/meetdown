
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
  
  // Create a date object for formatting - handle potential null/undefined dates
  if (!event.date || !event.time) {
    console.error('Event missing date or time:', event);
    // Return a default formatted event if date/time is missing
    return {
      id: event.id,
      title: event.title || 'Untitled Event',
      description: event.description || '',
      date: 'Date TBD',
      time: 'Time TBD',
      location: event.location || 'Location TBD',
      latitude: event.latitude ? parseFloat(event.latitude.toString()) : undefined,
      longitude: event.longitude ? parseFloat(event.longitude.toString()) : undefined,
      max_attendees: event.max_attendees || 10,
      cover_charge: event.cover_charge ? parseFloat(event.cover_charge.toString()) : 0,
      requires_reservation: event.requires_reservation || false,
      banner_url: event.banner_url,
      creator_id: event.creator_id,
      attendees: event.event_registrations?.length || 0,
      distance: 'Unknown distance',
      activity_tags: event.event_tags?.map((et: any) => et.activity_tags?.name).filter(Boolean) || [],
      is_registered: event.event_registrations?.some((reg: any) => reg.user_id === userId) || false
    };
  }

  const eventDate = new Date(event.date);
  const eventDateTime = new Date(`${event.date}T${event.time}`);
  
  // Check if dates are valid
  if (isNaN(eventDate.getTime()) || isNaN(eventDateTime.getTime())) {
    console.error('Invalid date/time for event:', event);
    return {
      id: event.id,
      title: event.title || 'Untitled Event',
      description: event.description || '',
      date: 'Invalid Date',
      time: 'Invalid Time',
      location: event.location || 'Location TBD',
      latitude: event.latitude ? parseFloat(event.latitude.toString()) : undefined,
      longitude: event.longitude ? parseFloat(event.longitude.toString()) : undefined,
      max_attendees: event.max_attendees || 10,
      cover_charge: event.cover_charge ? parseFloat(event.cover_charge.toString()) : 0,
      requires_reservation: event.requires_reservation || false,
      banner_url: event.banner_url,
      creator_id: event.creator_id,
      attendees: event.event_registrations?.length || 0,
      distance: 'Unknown distance',
      activity_tags: event.event_tags?.map((et: any) => et.activity_tags?.name).filter(Boolean) || [],
      is_registered: event.event_registrations?.some((reg: any) => reg.user_id === userId) || false
    };
  }
  
  // Format date based on preferences
  let formattedDate: string;
  try {
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
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = event.date;
  }
  
  // Format time based on preferences
  let formattedTime: string;
  try {
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
  } catch (error) {
    console.error('Error formatting time:', error);
    formattedTime = event.time;
  }
  
  return {
    id: event.id,
    title: event.title || 'Untitled Event',
    description: event.description || '',
    date: formattedDate,
    time: formattedTime,
    location: event.location || 'Location TBD',
    latitude: event.latitude ? parseFloat(event.latitude.toString()) : undefined,
    longitude: event.longitude ? parseFloat(event.longitude.toString()) : undefined,
    max_attendees: event.max_attendees || 10,
    cover_charge: event.cover_charge ? parseFloat(event.cover_charge.toString()) : 0,
    requires_reservation: event.requires_reservation || false,
    banner_url: event.banner_url,
    creator_id: event.creator_id,
    attendees: event.event_registrations?.length || 0,
    distance: userLocation ? calculateDistance(
      userLocation.lat, 
      userLocation.lng, 
      event.latitude ? parseFloat(event.latitude.toString()) : undefined,
      event.longitude ? parseFloat(event.longitude.toString()) : undefined
    ) : 'Unknown distance',
    activity_tags: event.event_tags?.map((et: any) => et.activity_tags?.name).filter(Boolean) || [],
    is_registered: event.event_registrations?.some((reg: any) => reg.user_id === userId) || false
  };
};
