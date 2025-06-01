
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { EventFilters } from '../EventFilters';

interface CoverChargeFilterProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

const CoverChargeFilter = ({ filters, onFiltersChange }: CoverChargeFilterProps) => {
  const handleCoverChargeChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      maxCoverCharge: value[0]
    });
  };

  const handleFreeEventsChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      freeEventsOnly: checked,
      maxCoverCharge: checked ? 0 : filters.maxCoverCharge
    });
  };

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="free-events"
            checked={filters.freeEventsOnly}
            onCheckedChange={handleFreeEventsChange}
          />
          <Label htmlFor="free-events">Free events only</Label>
        </div>
      </div>

      {!filters.freeEventsOnly && (
        <div className="space-y-2">
          <Label>Max cover charge: ${filters.maxCoverCharge}</Label>
          <Slider
            value={[filters.maxCoverCharge]}
            onValueChange={handleCoverChargeChange}
            max={50}
            min={0}
            step={5}
            className="w-full"
          />
        </div>
      )}
    </>
  );
};

export default CoverChargeFilter;
