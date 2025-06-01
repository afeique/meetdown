
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EventFilters } from '../EventFilters';

interface ReservationFilterProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

const ReservationFilter = ({ filters, onFiltersChange }: ReservationFilterProps) => {
  const handleReservationChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      noReservationRequired: checked
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="no-reservation"
          checked={filters.noReservationRequired}
          onCheckedChange={handleReservationChange}
        />
        <Label htmlFor="no-reservation">No reservation required</Label>
      </div>
    </div>
  );
};

export default ReservationFilter;
