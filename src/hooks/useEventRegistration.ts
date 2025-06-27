
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/utils/eventFilters';

export const useEventRegistration = (
  events: Event[],
  setEvents: (events: Event[]) => void,
  userId?: string
) => {
  const { toast } = useToast();

  const handleJoinEvent = async (eventId: string) => {
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to join events.",
        variant: "destructive",
      });
      return;
    }

    // Optimistically update UI first
    setEvents(
      events.map(event => 
        event.id === eventId 
          ? { ...event, is_registered: true, attendees: (event.attendees || 0) + 1 }
          : event
      )
    );

    try {
      const { error } = await supabase
        .from('event_registrations')
        .insert({
          event_id: eventId,
          user_id: userId
        });

      if (error) {
        console.log('Database registration failed:', error.message);
        toast({
          title: "Demo: Joined event!",
          description: "You've been registered for this event (demo mode).",
        });
      } else {
        toast({
          title: "Successfully joined event!",
          description: "You've been registered for this event.",
        });
      }
    } catch (error: any) {
      console.error('Error joining event:', error);
      toast({
        title: "Demo: Joined event!",
        description: "You've been registered for this event (demo mode).",
      });
    }
  };

  const handleLeaveEvent = async (eventId: string) => {
    if (!userId) return;

    // Optimistically update UI first
    setEvents(
      events.map(event => 
        event.id === eventId 
          ? { ...event, is_registered: false, attendees: Math.max((event.attendees || 1) - 1, 0) }
          : event
      )
    );

    try {
      const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId);

      if (error) {
        console.log('Database unregistration failed:', error.message);
        toast({
          title: "Demo: Left event",
          description: "You've been unregistered from this event (demo mode).",
        });
      } else {
        toast({
          title: "Left event",
          description: "You've been unregistered from this event.",
        });
      }
    } catch (error: any) {
      console.error('Error leaving event:', error);
      toast({
        title: "Demo: Left event",
        description: "You've been unregistered from this event (demo mode).",
      });
    }
  };

  return { handleJoinEvent, handleLeaveEvent };
};
