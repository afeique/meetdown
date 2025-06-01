
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  category: string;
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
}

const TagSelector = ({ selectedTags, onTagsChange }: TagSelectorProps) => {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
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

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(id => id !== tagId));
  };

  const groupedTags = availableTags.reduce((groups, tag) => {
    const category = tag.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(tag);
    return groups;
  }, {} as Record<string, Tag[]>);

  const selectedTagsData = availableTags.filter(tag => selectedTags.includes(tag.id));

  if (loading) {
    return <div className="text-sm text-gray-500">Loading tags...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selectedTagsData.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Selected Tags</label>
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

      {/* Available Tags by Category */}
      <div className="space-y-3">
        <label className="text-sm font-medium">Add Tags</label>
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
                  variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTag(tag.id)}
                  className="text-xs"
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TagSelector;
