import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';
import EventBasicInfoFields from './forms/EventBasicInfoFields';
import EventBannerSection from './forms/EventBannerSection';
import EventDetailsFields from './forms/EventDetailsFields';
import EventTagsSection from './forms/EventTagsSection';
import CreateEventFormActions from './forms/CreateEventFormActions';

interface MyEventsCreateFormProps {
  onEventCreated: () => void;
}

const MyEventsCreateForm = ({ onEventCreated }: MyEventsCreateFormProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxAttendees: 10,
    coverCharge: 0,
    requiresReservation: false,
  });
  const { toast } = useToast();

  const parseTagsFromInput = (input: string): string[] => {
    return input
      .split(/[,;]/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.toLowerCase());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const tagNames = parseTagsFromInput(tagInput);
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

      // Reset form
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
      setBannerUrl('');
      setTagInput('');
      setIsOpen(false);
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create New Event
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Event</CardTitle>
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

          <CreateEventFormActions
            isSubmitting={isSubmitting}
            onCancel={() => setIsOpen(false)}
          />
        </form>
      </CardContent>
    </Card>
  );
};

export default MyEventsCreateForm;
