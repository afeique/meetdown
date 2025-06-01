
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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

interface Tag {
  id: string;
  name: string;
  category: string;
}

const EventFiltersComponent = ({ filters, onFiltersChange }: EventFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isExpanded) {
      fetchTags();
    }
  }, [isExpanded]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_tags')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setAvailableTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleTagToggle = (tagId: string) => {
    const isSelected = filters.selectedTags.includes(tagId);
    const newSelectedTags = isSelected
      ? filters.selectedTags.filter(id => id !== tagId)
      : [...filters.selectedTags, tagId];

    onFiltersChange({
      ...filters,
      selectedTags: newSelectedTags
    });
  };

  const removeTag = (tagId: string) => {
    onFiltersChange({
      ...filters,
      selectedTags: filters.selectedTags.filter(id => id !== tagId)
    });
  };

  const resetFilters = () => {
    onFiltersChange({
      maxCoverCharge: 50,
      noReservationRequired: false,
      freeEventsOnly: false,
      selectedTags: []
    });
  };

  const groupedTags = availableTags.reduce((groups, tag) => {
    const category = tag.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(tag);
    return groups;
  }, {} as Record<string, Tag[]>);

  const selectedTagsData = availableTags.filter(tag => filters.selectedTags.includes(tag.id));

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

          {/* Tags Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Filter by Tags</Label>
            
            {/* Selected Tags */}
            {selectedTagsData.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs text-gray-600">Selected:</div>
                <div className="flex flex-wrap gap-2">
                  {selectedTagsData.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tag.id)}
                        className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Available Tags */}
            {loading ? (
              <div className="text-sm text-gray-500">Loading tags...</div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {Object.entries(groupedTags).map(([category, tags]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Button
                          key={tag.id}
                          type="button"
                          variant={filters.selectedTags.includes(tag.id) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleTagToggle(tag.id)}
                          className="text-xs h-7"
                        >
                          {tag.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
