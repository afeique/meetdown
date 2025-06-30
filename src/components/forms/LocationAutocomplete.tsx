
import React from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';

interface LocationAutocompleteProps {
  location: string;
  onLocationChange: (value: string) => void;
  required?: boolean;
}

const LocationAutocomplete = ({ location, onLocationChange, required = false }: LocationAutocompleteProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        Location
      </label>
      <Input
        placeholder="Enter event location (e.g., 123 Main St, City, State)"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        required={required}
      />
      <p className="text-xs text-gray-500">
        Please include the full address for better event discovery
      </p>
    </div>
  );
};

export default LocationAutocomplete;
