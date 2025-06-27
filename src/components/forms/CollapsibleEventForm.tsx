
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import EventFormContent from './EventFormContent';
import { useEventForm } from '@/hooks/useEventForm';
import { parseTagsFromInput } from '@/utils/tagUtils';

interface CollapsibleEventFormProps {
  onEventCreated: () => void;
  title?: string;
}

const CollapsibleEventForm = ({ onEventCreated, title = "Create New Event" }: CollapsibleEventFormProps) => {
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

  const handleCancel = () => {
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
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <EventFormContent
          formData={formData}
          bannerUrl={bannerUrl}
          tagInput={tagInput}
          isSubmitting={isSubmitting}
          onInputChange={handleInputChange}
          onBannerChange={setBannerUrl}
          onTagInputChange={setTagInput}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </CardContent>
    </Card>
  );
};

export default CollapsibleEventForm;
