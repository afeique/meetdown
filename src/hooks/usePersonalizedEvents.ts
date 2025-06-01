
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { transformEventData } from '@/utils/eventDataTransform';
import { Event } from '@/utils/eventFilters';

export const usePersonalizedEvents = (
  userId?: string,
  selectedTagNames: string[] = [],
  userLocation?: { lat: number; lng: number }
) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPersonalizedEvents = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      console.log('Fetching personalized events based on user interests...');
      
      // First, get user's interests
      const { data: userInterests, error: interestsError } = await supabase
        .from('user_interests')
        .select(`
          activity_tags (
            id,
            name
          )
        `)
        .eq('user_id', userId);

      if (interestsError) {
        console.log('Error fetching user interests:', interestsError.message);
        throw interestsError;
      }

      const interestTagIds = userInterests?.map(ui => ui.activity_tags.id) || [];
      
      // Combine user interests with selected filter tags
      let tagFilter: string[] = [];
      if (selectedTagNames.length > 0) {
        // Get tag IDs for selected tag names
        const { data: selectedTagData, error: tagError } = await supabase
          .from('activity_tags')
          .select('id, name')
          .in('name', selectedTagNames);
        
        if (!tagError && selectedTagData) {
          tagFilter = selectedTagData.map(tag => tag.id);
        }
      } else {
        tagFilter = interestTagIds;
      }

      if (tagFilter.length === 0) {
        console.log('No tags to filter by, showing all events');
        // If user has no interests, show all events
        const { data: allEvents, error } = await supabase
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

        if (error) {
          console.log('Database query failed:', error.message);
          throw error;
        }

        if (allEvents && allEvents.length > 0) {
          const eventsData = allEvents.map((event: any) => 
            transformEventData(event, userLocation, userId)
          );
          setEvents(eventsData);
        } else {
          setEvents([]);
        }
        return;
      }

      // Fetch events that match the tag filter
      const { data: personalizedEvents, error } = await supabase
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
        .in('event_tags.tag_id', tagFilter)
        .order('date', { ascending: true });

      if (error) {
        console.log('Database query failed:', error.message);
        throw error;
      }

      if (personalizedEvents && personalizedEvents.length > 0) {
        console.log('Successfully fetched personalized events from database');
        
        const eventsData = personalizedEvents.map((event: any) => 
          transformEventData(event, userLocation, userId)
        );
        setEvents(eventsData);
      } else {
        console.log('No personalized events found');
        setEvents([]);
      }
    } catch (error: any) {
      console.error('Error fetching personalized events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPersonalizedEvents();
    }
  }, [userId, selectedTagNames]);

  return { events, setEvents, loading, refetch: fetchPersonalizedEvents };
};
