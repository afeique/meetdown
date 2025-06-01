
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { EventFilters } from '../EventFilters';
import { Tag } from '@/hooks/useActivityTags';
import { useState, useEffect } from 'react';

interface TagsFilterProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  availableTags: Tag[];
  loading: boolean;
}

const TagsFilter = ({ filters, onFiltersChange, availableTags, loading }: TagsFilterProps) => {
  const [tagInput, setTagInput] = useState('');

  // Initialize the input field with current selected tag names
  useEffect(() => {
    if (filters.selectedTags.length > 0 && availableTags.length > 0) {
      const selectedTagNames = availableTags
        .filter(tag => filters.selectedTags.includes(tag.id))
        .map(tag => tag.name)
        .join(', ');
      setTagInput(selectedTagNames);
    } else {
      setTagInput('');
    }
  }, [filters.selectedTags, availableTags]);

  const handleTagInputChange = (value: string) => {
    setTagInput(value);
    
    // Parse the input to extract tag names
    const tagNames = value
      .split(/[,;]/)
      .map(name => name.trim())
      .filter(name => name.length > 0);

    // Find matching tag IDs from available tags
    const matchingTagIds = availableTags
      .filter(tag => tagNames.some(inputName => 
        tag.name.toLowerCase().includes(inputName.toLowerCase()) ||
        inputName.toLowerCase().includes(tag.name.toLowerCase())
      ))
      .map(tag => tag.id);

    onFiltersChange({
      ...filters,
      selectedTags: matchingTagIds
    });
  };

  const removeTag = (tagId: string) => {
    const updatedTags = filters.selectedTags.filter(id => id !== tagId);
    onFiltersChange({
      ...filters,
      selectedTags: updatedTags
    });

    // Update the input field
    const remainingTagNames = availableTags
      .filter(tag => updatedTags.includes(tag.id))
      .map(tag => tag.name)
      .join(', ');
    setTagInput(remainingTagNames);
  };

  const selectedTagsData = availableTags.filter(tag => filters.selectedTags.includes(tag.id));

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Filter by Tags</Label>
      
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Enter tags separated by commas or semicolons..."
          value={tagInput}
          onChange={(e) => handleTagInputChange(e.target.value)}
          className="w-full"
        />
        <div className="text-xs text-gray-500">
          Type tag names separated by commas (,) or semicolons (;)
        </div>
      </div>
      
      {/* Selected Tags */}
      {selectedTagsData.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-gray-600">Active filters:</div>
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

      {loading && (
        <div className="text-sm text-gray-500">Loading tags...</div>
      )}
    </div>
  );
};

export default TagsFilter;
