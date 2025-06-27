
import React from 'react';
import EventBasicInfoFields from './EventBasicInfoFields';
import EventBannerSection from './EventBannerSection';
import EventDetailsFields from './EventDetailsFields';
import EventTagsSection from './EventTagsSection';
import CreateEventFormActions from './CreateEventFormActions';
import { parseTagsFromInput } from '@/utils/tagUtils';

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

interface EventFormContentProps {
  formData: EventFormData;
  bannerUrl: string;
  tagInput: string;
  isSubmitting: boolean;
  onInputChange: (field: string, value: any) => void;
  onBannerChange: (url: string) => void;
  onTagInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
}

const EventFormContent = ({
  formData,
  bannerUrl,
  tagInput,
  isSubmitting,
  onInputChange,
  onBannerChange,
  onTagInputChange,
  onSubmit,
  onCancel
}: EventFormContentProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <EventBasicInfoFields
        title={formData.title}
        description={formData.description}
        onTitleChange={(value) => onInputChange('title', value)}
        onDescriptionChange={(value) => onInputChange('description', value)}
      />

      <EventBannerSection
        bannerUrl={bannerUrl}
        eventTitle={formData.title}
        onBannerChange={onBannerChange}
      />

      <EventDetailsFields
        date={formData.date}
        time={formData.time}
        location={formData.location}
        maxAttendees={formData.maxAttendees}
        coverCharge={formData.coverCharge}
        requiresReservation={formData.requiresReservation}
        onDateChange={(value) => onInputChange('date', value)}
        onTimeChange={(value) => onInputChange('time', value)}
        onLocationChange={(value) => onInputChange('location', value)}
        onMaxAttendeesChange={(value) => onInputChange('maxAttendees', value)}
        onCoverChargeChange={(value) => onInputChange('coverCharge', value)}
        onRequiresReservationChange={(value) => onInputChange('requiresReservation', value)}
      />

      <EventTagsSection
        tagInput={tagInput}
        onTagInputChange={onTagInputChange}
        parseTagsFromInput={parseTagsFromInput}
      />

      <CreateEventFormActions
        isSubmitting={isSubmitting}
        onCancel={onCancel}
      />
    </form>
  );
};

export default EventFormContent;
