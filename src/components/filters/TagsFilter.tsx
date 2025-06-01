
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { EventFilters } from '../EventFilters';
import { Tag } from '@/hooks/useActivityTags';

interface TagsFilterProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  availableTags: Tag[];
  loading: boolean;
}

const TagsFilter = ({ filters, onFiltersChange, availableTags, loading }: TagsFilterProps) => {
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
  );
};

export default TagsFilter;
