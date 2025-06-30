import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { transformEventData } from '@/utils/eventDataTransform';
import { Event } from '@/utils/eventFilters';

interface DateTimePreferences {
  dateFormat: 'month-day' | 'full-date' | 'short-date';
  timeFormat: '12-hour' | '24-hour';
  showTimezone: boolean;
}

export const useMyEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [dateTimePrefs, setDateTimePrefs] = useState<DateTimePreferences>({
    dateFormat: 'month-day',
    timeFormat: '12-hour',
    showTimezone: true
  });

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('date_time_preferences')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.date_time_preferences) {
          try {
            const prefs = data.date_time_preferences as unknown as DateTimePreferences;
            if (prefs && typeof prefs === 'object' && !Array.isArray(prefs)) {
              setDateTimePrefs({
                dateFormat: prefs.dateFormat || 'month-day',
                timeFormat: prefs.timeFormat || '12-hour',
                showTimezone: prefs.showTimezone !== undefined ? prefs.showTimezone : true
              });
            }
          } catch (parseError) {
            console.error('Error parsing date time preferences:', parseError);
          }
        }
      } catch (error: any) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserPreferences();
  }, [user]);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;

      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('creator_id', user.id)
          .order('date', { ascending: true });

        if (eventsError) throw eventsError;

        const eventsWithAttendees = await Promise.all(
          (eventsData || []).map(async (event) => {
            const { count } = await supabase
              .from('event_registrations')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id);

            const { data: userRegistration } = await supabase
              .from('event_registrations')
              .select('id')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .single();

            const transformedEvent = transformEventData({
              ...event,
              event_registrations: userRegistration ? [{ user_id: user.id }] : []
            }, undefined, user.id, dateTimePrefs);

            return {
              ...transformedEvent,
              attendees: count || 0,
              is_registered: !!userRegistration,
            };
          })
        );

        setEvents(eventsWithAttendees);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error loading events",
          description: error.message || "Failed to load your events. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user, toast, dateTimePrefs]);

  const parseEventDateTime = (dateStr: string, timeStr: string): Date | null => {
    try {
      // Handle different date formats
      let eventDate: Date;
      
      // Check if it's in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        const [hours, minutes] = timeStr.split(':').map(Number);
        eventDate = new Date(year, month - 1, day, hours, minutes);
      } 
      // Handle "Month Day" format (e.g., "June 15", "June 30")
      else if (/^[A-Za-z]+ \d{1,2}$/.test(dateStr)) {
        const currentYear = new Date().getFullYear();
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        // Parse the month name and day
        const [monthName, dayStr] = dateStr.split(' ');
        const day = parseInt(dayStr);
        
        // Convert month name to number
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
        
        if (month === -1) {
          console.warn('Invalid month name:', monthName);
          return null;
        }
        
        eventDate = new Date(currentYear, month, day, hours, minutes);
      }
      // Try parsing as a general date string
      else {
        const [hours, minutes] = timeStr.split(':').map(Number);
        eventDate = new Date(dateStr);
        
        if (isNaN(eventDate.getTime())) {
          console.warn('Could not parse date:', dateStr);
          return null;
        }
        
        // Set the time
        eventDate.setHours(hours, minutes, 0, 0);
      }
      
      // Validate the resulting date
      if (isNaN(eventDate.getTime())) {
        console.warn('Invalid date created:', dateStr, timeStr);
        return null;
      }
      
      return eventDate;
    } catch (error) {
      console.error('Error parsing date:', dateStr, timeStr, error);
      return null;
    }
  };

  const separateEvents = (events: Event[]) => {
    const now = new Date();
    const pastEvents: Event[] = [];
    const upcomingEvents: Event[] = [];

    events.forEach(event => {
      // Validate date and time before creating Date object
      if (!event.date || !event.time) {
        console.warn('Event missing date or time:', event.title, event.date, event.time);
        // Add to upcoming if missing date/time to be safe
        upcomingEvents.push(event);
        return;
      }

      const eventDateTime = parseEventDateTime(event.date, event.time);
      
      if (!eventDateTime) {
        console.warn('Could not parse event date/time:', event.title, event.date, event.time);
        // Add to upcoming if we can't parse the date to be safe
        upcomingEvents.push(event);
        return;
      }
      
      console.log('Event:', event.title, 'Date:', event.date, 'Time:', event.time, 'Parsed DateTime:', eventDateTime, 'Now:', now, 'Is Past:', eventDateTime < now);
      
      if (eventDateTime < now) {
        pastEvents.push(event);
      } else {
        upcomingEvents.push(event);
      }
    });

    // Sort upcoming events by date/time (soonest first)
    upcomingEvents.sort((a, b) => {
      const dateA = parseEventDateTime(a.date, a.time);
      const dateB = parseEventDateTime(b.date, b.time);
      
      // Handle invalid dates
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return dateA.getTime() - dateB.getTime();
    });

    // Sort past events by date/time (most recent first)
    pastEvents.sort((a, b) => {
      const dateA = parseEventDateTime(a.date, a.time);
      const dateB = parseEventDateTime(b.date, b.time);
      
      // Handle invalid dates
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      return dateB.getTime() - dateA.getTime();
    });

    console.log('Separated events:', { pastEvents: pastEvents.length, upcomingEvents: upcomingEvents.length });

    return { pastEvents, upcomingEvents };
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('creator_id', user?.id);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error deleting event",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const handleEventUpdated = () => {
    setEditingEvent(null);
    window.location.reload();
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
  };

  return {
    events,
    setEvents,
    loading,
    editingEvent,
    separateEvents,
    handleDeleteEvent,
    handleEditEvent,
    handleEventUpdated,
    handleCancelEdit
  };
};
