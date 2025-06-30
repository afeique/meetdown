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
      // Create a proper datetime object for comparison
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      
      console.log('Event:', event.title, 'DateTime:', eventDateTime, 'Now:', now, 'Is Past:', eventDateTime < now);
      
      if (eventDateTime < now) {
        pastEvents.push(event);
      } else {
        upcomingEvents.push(event);
      }
    });

    // Sort upcoming events by date/time (soonest first)
    upcomingEvents.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });

    // Sort past events by date/time (most recent first)
    pastEvents.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
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
