
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';

export interface EventFilters {
  maxCoverCharge: number;
  noReservationRequired: boolean;
  freeEventsOnly: boolean;
}

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

const EventFiltersComponent = ({ filters, onFiltersChange }: EventFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleReservationChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      noReservationRequired: checked
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      maxCoverCharge: 50,
      noReservationRequired: false,
      freeEventsOnly: false
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Filters</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Filters
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
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

          <Button 
            variant="outline" 
            size="sm" 
            onClick={resetFilters}
            className="w-full"
          >
            Reset Filters
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default EventFiltersComponent;
