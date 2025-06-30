
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
        // Get today's date in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('creator_id', user.id)
          .gte('date', todayStr)  // Only get events from today onwards
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

        // Filter out events that are actually in the past (considering time)
        const upcomingEvents = eventsWithAttendees.filter(event => {
          const eventDateTime = parseEventDateTime(event.date, event.time);
          return eventDateTime && eventDateTime > new Date();
        });

        setEvents(upcomingEvents);
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
      const currentYear = new Date().getFullYear();
      let eventDate: Date;
      
      // Handle different date formats
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        // YYYY-MM-DD format
        const [year, month, day] = dateStr.split('-').map(Number);
        eventDate = new Date(year, month - 1, day);
      } else if (/^[A-Za-z]+ \d{1,2}$/.test(dateStr)) {
        // "Month Day" format (e.g., "June 15", "June 30")
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
        
        eventDate = new Date(currentYear, month, day);
      } else {
        // Try parsing as a general date string
        eventDate = new Date(dateStr);
        
        if (isNaN(eventDate.getTime())) {
          console.warn('Could not parse date:', dateStr);
          return null;
        }
      }
      
      // Parse and set the time
      if (timeStr) {
        // Handle time formats like "5:45 PM EDT" or "10:00 AM EST"
        const timeMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
        if (timeMatch) {
          let hours = parseInt(timeMatch[1]);
          const minutes = parseInt(timeMatch[2]);
          const isPM = timeMatch[3] && timeMatch[3].toUpperCase() === 'PM';
          
          // Convert to 24-hour format
          if (isPM && hours !== 12) {
            hours += 12;
          } else if (!isPM && hours === 12) {
            hours = 0;
          }
          
          eventDate.setHours(hours, minutes, 0, 0);
        } else {
          // If time parsing fails, default to noon
          eventDate.setHours(12, 0, 0, 0);
        }
      } else {
        // Default to noon if no time provided
        eventDate.setHours(12, 0, 0, 0);
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
    handleDeleteEvent,
    handleEditEvent,
    handleEventUpdated,
    handleCancelEdit
  };
};
