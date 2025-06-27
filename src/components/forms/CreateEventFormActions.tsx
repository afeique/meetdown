
import { Button } from '@/components/ui/button';

interface CreateEventFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

const CreateEventFormActions = ({ isSubmitting, onCancel }: CreateEventFormActionsProps) => {
  return (
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
        {isSubmitting ? 'Creating...' : 'Create Event'}
      </Button>
    </div>
  );
};

export default CreateEventFormActions;
