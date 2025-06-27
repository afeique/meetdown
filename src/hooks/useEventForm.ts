
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  maxAttendees: number;
  coverCharge: number;
  requiresReservation: boolean;
}

export const useEventForm = (onEventCreated: () => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: 10,
    coverCharge: 0,
    requiresReservation: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      maxAttendees: 10,
      coverCharge: 0,
      requiresReservation: false,
    });
  };

  const createEvent = async (bannerUrl: string, tagNames: string[]) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create the event
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert([{
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          max_attendees: formData.maxAttendees,
          cover_charge: formData.coverCharge,
          requires_reservation: formData.requiresReservation,
          creator_id: user.id,
          banner_url: bannerUrl || null,
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // Process tags if any are entered
      if (tagNames.length > 0 && eventData) {
        // Find existing tags or create new ones
        const { data: existingTags } = await supabase
          .from('activity_tags')
          .select('id, name')
          .in('name', tagNames);

        const existingTagNames = existingTags?.map(tag => tag.name.toLowerCase()) || [];
        const newTagNames = tagNames.filter(name => !existingTagNames.includes(name));

        // Create new tags
        let allTagIds = existingTags?.map(tag => tag.id) || [];
        
        if (newTagNames.length > 0) {
          const { data: newTags, error: newTagsError } = await supabase
            .from('activity_tags')
            .insert(newTagNames.map(name => ({ name, category: 'Other' })))
            .select('id');

          if (newTagsError) {
            console.error('Error creating new tags:', newTagsError);
          } else {
            allTagIds = [...allTagIds, ...(newTags?.map(tag => tag.id) || [])];
          }
        }

        // Link tags to event
        if (allTagIds.length > 0) {
          const tagInserts = allTagIds.map(tagId => ({
            event_id: eventData.id,
            tag_id: tagId
          }));

          const { error: tagsError } = await supabase
            .from('event_tags')
            .insert(tagInserts);

          if (tagsError) {
            console.error('Error adding tags to event:', tagsError);
          }
        }
      }

      toast({
        title: "Event created!",
        description: "Your event has been successfully created.",
      });

      resetForm();
      onEventCreated();
      
      // Since we're already on the My Events page, just refresh the page
      window.location.reload();
    } catch (error: any) {
      console.error('Error creating event:', error);
      toast({
        title: "Error creating event",
        description: error.message || "Failed to create event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    handleInputChange,
    createEvent,
  };
};
