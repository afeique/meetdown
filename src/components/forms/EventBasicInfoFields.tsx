
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface EventBasicInfoFieldsProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

const EventBasicInfoFields = ({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange 
}: EventBasicInfoFieldsProps) => {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm font-medium">Event Title</label>
        <Input
          placeholder="Enter event title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Describe your event"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>
    </>
  );
};

export default EventBasicInfoFields;
