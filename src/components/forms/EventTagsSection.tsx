
import { Input } from '@/components/ui/input';
import { Tag } from 'lucide-react';

interface EventTagsSectionProps {
  tagInput: string;
  onTagInputChange: (value: string) => void;
  parseTagsFromInput: (input: string) => string[];
}

const EventTagsSection = ({ tagInput, onTagInputChange, parseTagsFromInput }: EventTagsSectionProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        <Tag className="h-4 w-4" />
        Tags
      </label>
      <Input
        placeholder="Enter tags separated by commas or semicolons (e.g., hiking, outdoors; fitness)"
        value={tagInput}
        onChange={(e) => onTagInputChange(e.target.value)}
      />
      {tagInput && (
        <div className="flex flex-wrap gap-2 mt-2">
          {parseTagsFromInput(tagInput).map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventTagsSection;
