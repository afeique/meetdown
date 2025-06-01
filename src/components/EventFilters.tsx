
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useActivityTags } from '@/hooks/useActivityTags';
import { resetFilters } from '@/utils/filterUtils';
import CoverChargeFilter from './filters/CoverChargeFilter';
import ReservationFilter from './filters/ReservationFilter';
import TagsFilter from './filters/TagsFilter';

export interface EventFilters {
  maxCoverCharge: number;
  noReservationRequired: boolean;
  freeEventsOnly: boolean;
  selectedTags: string[];
}

interface EventFiltersProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
}

const EventFiltersComponent = ({ filters, onFiltersChange }: EventFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { availableTags, loading } = useActivityTags(isExpanded);

  const handleResetFilters = () => {
    onFiltersChange(resetFilters());
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
          <CoverChargeFilter 
            filters={filters}
            onFiltersChange={onFiltersChange}
          />

          <ReservationFilter 
            filters={filters}
            onFiltersChange={onFiltersChange}
          />

          <TagsFilter 
            filters={filters}
            onFiltersChange={onFiltersChange}
            availableTags={availableTags}
            loading={loading}
          />

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetFilters}
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
