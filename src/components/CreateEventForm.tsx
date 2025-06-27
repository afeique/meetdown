
import CollapsibleEventForm from './forms/CollapsibleEventForm';

interface CreateEventFormProps {
  onEventCreated: () => void;
}

const CreateEventForm = ({ onEventCreated }: CreateEventFormProps) => {
  return <CollapsibleEventForm onEventCreated={onEventCreated} />;
};

export default CreateEventForm;
