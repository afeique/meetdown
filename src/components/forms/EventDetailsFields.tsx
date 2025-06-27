
import { Input } from '@/components/ui/input';
import { Calendar, Clock, Users, DollarSign } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';

interface EventDetailsFieldsProps {
  date: string;
  time: string;
  location: string;
  maxAttendees: number;
  coverCharge: number;
  requiresReservation: boolean;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onMaxAttendeesChange: (value: number) => void;
  onCoverChargeChange: (value: number) => void;
  onRequiresReservationChange: (value: boolean) => void;
}

const EventDetailsFields = ({
  date,
  time,
  location,
  maxAttendees,
  coverCharge,
  requiresReservation,
  onDateChange,
  onTimeChange,
  onLocationChange,
  onMaxAttendeesChange,
  onCoverChargeChange,
  onRequiresReservationChange
}: EventDetailsFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Date
          </label>
          <Input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Time
          </label>
          <Input
            type="time"
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            required
          />
        </div>
      </div>

      <LocationAutocomplete
        location={location}
        onLocationChange={onLocationChange}
        required={true}
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Users className="h-4 w-4" />
            Max Attendees
          </label>
          <Input
            type="number"
            min="1"
            value={maxAttendees}
            onChange={(e) => onMaxAttendeesChange(parseInt(e.target.value))}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Cover Charge ($)
          </label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={coverCharge}
            onChange={(e) => onCoverChargeChange(parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="requiresReservation"
          checked={requiresReservation}
          onChange={(e) => onRequiresReservationChange(e.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="requiresReservation" className="text-sm font-medium">
          Requires Reservation
        </label>
      </div>
    </>
  );
};

export default EventDetailsFields;
