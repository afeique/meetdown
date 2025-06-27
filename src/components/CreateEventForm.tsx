
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import EventBasicInfoFields from './forms/EventBasicInfoFields';
import EventBannerSection from './forms/EventBannerSection';
import EventDetailsFields from './forms/EventDetailsFields';
import EventTagsSection from './forms/EventTagsSection';
import CreateEventFormActions from './forms/CreateEventFormActions';
import { useEventForm } from '@/hooks/useEventForm';
import { parseTagsFromInput } from '@/utils/tagUtils';

interface CreateEventFormProps {
  onEventCreated: () => void;
}

const CreateEventForm = ({ onEventCreated }: CreateEventFormProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  const { formData, isSubmitting, handleInputChange, createEvent } = useEventForm(onEventCreated);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagNames = parseTagsFromInput(tagInput);
    await createEvent(bannerUrl, tagNames);
    
    // Reset form state
    setBannerUrl('');
    setTagInput('');
    setIsOpen(false);
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

export default CreateEventForm;
