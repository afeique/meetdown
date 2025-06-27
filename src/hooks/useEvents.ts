
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { transformEventData } from '@/utils/eventDataTransform';
import { Event } from '@/utils/eventFilters';

export const useEvents = (
  userId?: string,
  selectedTagNames: string[] = [],
  userLocation?: { lat: number; lng: number }
) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      console.log('Fetching all events from database...');
      
      let query = supabase
        .from('events')
        .select(`
          *,
          event_tags (
            activity_tags (
              name
            )
          ),
          event_registrations (
            id,
            user_id
          )
        `)
        .order('date', { ascending: true });

      // If specific tags are selected, filter by those tags
      if (selectedTagNames.length > 0) {
        // Get tag IDs for selected tag names
        const { data: selectedTagData, error: tagError } = await supabase
          .from('activity_tags')
          .select('id, name')
          .in('name', selectedTagNames);
        
        if (!tagError && selectedTagData && selectedTagData.length > 0) {
          const tagIds = selectedTagData.map(tag => tag.id);
          
          // Use inner join to filter events by tags
          query = supabase
            .from('events')
            .select(`
              *,
              event_tags!inner (
                activity_tags (
                  name
                )
              ),
              event_registrations (
                id,
                user_id
              )
            `)
            .in('event_tags.tag_id', tagIds)
            .order('date', { ascending: true });
        }
      }

      const { data: eventsData, error } = await query;

      if (error) {
        console.log('Database query failed:', error.message);
        throw error;
      }

      if (eventsData && eventsData.length > 0) {
        console.log('Successfully fetched events from database');
        
        const transformedEvents = eventsData.map((event: any) => 
          transformEventData(event, userLocation, userId)
        );
        setEvents(transformedEvents);
      } else {
        console.log('No events found');
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [userId, selectedTagNames, userLocation]);

  return { events, setEvents, loading, refetch: fetchEvents };
};
