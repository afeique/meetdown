
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import EventBasicInfoFields from './forms/EventBasicInfoFields';
import EventBannerSection from './forms/EventBannerSection';
import EventDetailsFields from './forms/EventDetailsFields';
import EventTagsSection from './forms/EventTagsSection';
import { parseTagsFromInput } from '@/utils/tagUtils';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  cover_charge: number;
  requires_reservation: boolean;
  banner_url?: string;
}

interface EventEditFormProps {
  event: Event;
  onEventUpdated: () => void;
  onCancel: () => void;
}

const EventEditForm = ({ event, onEventUpdated, onCancel }: EventEditFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(event.banner_url || '');
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    maxAttendees: event.max_attendees,
    coverCharge: event.cover_charge,
    requiresReservation: event.requires_reservation,
  });
  const { toast } = useToast();

  // Load existing tags for the event
  useEffect(() => {
    const loadEventTags = async () => {
      const { data: eventTags } = await supabase
        .from('event_tags')
        .select(`
          activity_tags (
            name
          )
        `)
        .eq('event_id', event.id);

      if (eventTags) {
        const tagNames = eventTags
          .map(et => et.activity_tags?.name)
          .filter(name => name)
          .join(', ');
        setTagInput(tagNames);
      }
    };

    loadEventTags();
  }, [event.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update the event
      const { error: eventError } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          max_attendees: formData.maxAttendees,
          cover_charge: formData.coverCharge,
          requires_reservation: formData.requiresReservation,
          banner_url: bannerUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', event.id);

      if (eventError) throw eventError;

      // Update tags
      // First, remove existing tags
      await supabase
        .from('event_tags')
        .delete()
        .eq('event_id', event.id);

      // Process new tags if any are entered
      const tagNames = parseTagsFromInput(tagInput);
      if (tagNames.length > 0) {
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
            event_id: event.id,
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
        title: "Event updated!",
        description: "Your event has been successfully updated.",
      });

      onEventUpdated();
    } catch (error: any) {
      console.error('Error updating event:', error);
      toast({
        title: "Error updating event",
        description: error.message || "Failed to update event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Event</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <EventBasicInfoFields
            title={formData.title}
            description={formData.description}
            onTitleChange={(value) => handleInputChange('title', value)}
            onDescriptionChange={(value) => handleInputChange('description', value)}
          />

          <EventBannerSection
            bannerUrl={bannerUrl}
            eventTitle={formData.title}
            onBannerChange={setBannerUrl}
          />

          <EventDetailsFields
            date={formData.date}
            time={formData.time}
            location={formData.location}
            maxAttendees={formData.maxAttendees}
            coverCharge={formData.coverCharge}
            requiresReservation={formData.requiresReservation}
            onDateChange={(value) => handleInputChange('date', value)}
            onTimeChange={(value) => handleInputChange('time', value)}
            onLocationChange={(value) => handleInputChange('location', value)}
            onMaxAttendeesChange={(value) => handleInputChange('maxAttendees', value)}
            onCoverChargeChange={(value) => handleInputChange('coverCharge', value)}
            onRequiresReservationChange={(value) => handleInputChange('requiresReservation', value)}
          />

          <EventTagsSection
            tagInput={tagInput}
            onTagInputChange={setTagInput}
            parseTagsFromInput={parseTagsFromInput}
          />

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSubmitting ? 'Updating...' : 'Update Event'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EventEditForm;
