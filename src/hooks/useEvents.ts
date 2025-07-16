
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
      
      // Get current date to filter out past events
      const today = new Date().toISOString().split('T')[0];
      
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
        .gte('date', today)
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
            .gte('date', today)
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
        
        let transformedEvents = eventsData.map((event: any) => 
          transformEventData(event, userLocation, userId)
        );

        // Sort by distance if user location is available
        if (userLocation) {
          transformedEvents = transformedEvents.sort((a, b) => {
            const distanceA = a.distance ? parseFloat(a.distance) : Infinity;
            const distanceB = b.distance ? parseFloat(b.distance) : Infinity;
            return distanceA - distanceB;
          });
        }

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
