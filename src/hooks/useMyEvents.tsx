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

      try {
        // Parse the date string properly - event.date should be in YYYY-MM-DD format
        const [year, month, day] = event.date.split('-').map(Number);
        const [hours, minutes] = event.time.split(':').map(Number);
        
        // Create date object with proper parsing
        const eventDateTime = new Date(year, month - 1, day, hours, minutes); // month is 0-indexed
        
        // Check if the date is valid
        if (isNaN(eventDateTime.getTime())) {
          console.warn('Invalid date/time for event:', event.title, event.date, event.time);
          // Add to upcoming if invalid date/time to be safe
          upcomingEvents.push(event);
          return;
        }
        
        console.log('Event:', event.title, 'Date:', event.date, 'Time:', event.time, 'Parsed DateTime:', eventDateTime, 'Now:', now, 'Is Past:', eventDateTime < now);
        
        if (eventDateTime < now) {
          pastEvents.push(event);
        } else {
          upcomingEvents.push(event);
        }
      } catch (error) {
        console.error('Error parsing date for event:', event.title, error);
        // Add to upcoming if error occurs to be safe
        upcomingEvents.push(event);
      }
    });

    // Sort upcoming events by date/time (soonest first)
    upcomingEvents.sort((a, b) => {
      try {
        const [yearA, monthA, dayA] = a.date.split('-').map(Number);
        const [hoursA, minutesA] = a.time.split(':').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA);
        
        const [yearB, monthB, dayB] = b.date.split('-').map(Number);
        const [hoursB, minutesB] = b.time.split(':').map(Number);
        const dateB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB);
        
        // Handle invalid dates
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return dateA.getTime() - dateB.getTime();
      } catch (error) {
        console.error('Error sorting upcoming events:', error);
        return 0;
      }
    });

    // Sort past events by date/time (most recent first)
    pastEvents.sort((a, b) => {
      try {
        const [yearA, monthA, dayA] = a.date.split('-').map(Number);
        const [hoursA, minutesA] = a.time.split(':').map(Number);
        const dateA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA);
        
        const [yearB, monthB, dayB] = b.date.split('-').map(Number);
        const [hoursB, minutesB] = b.time.split(':').map(Number);
        const dateB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB);
        
        // Handle invalid dates
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        
        return dateB.getTime() - dateA.getTime();
      } catch (error) {
        console.error('Error sorting past events:', error);
        return 0;
      }
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
