
import CollapsibleEventForm from './forms/CollapsibleEventForm';

interface MyEventsCreateFormProps {
  onEventCreated: () => void;
}

const MyEventsCreateForm = ({ onEventCreated }: MyEventsCreateFormProps) => {
  return <CollapsibleEventForm onEventCreated={onEventCreated} />;
};

export default MyEventsCreateForm;
