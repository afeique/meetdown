
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { loadGoogleMaps, isGoogleMapsAvailable } from '@/services/googleMapsService';
import { useToast } from '@/hooks/use-toast';

interface LocationAutocompleteProps {
  location: string;
  onLocationChange: (value: string) => void;
  required?: boolean;
}

const LocationAutocomplete = ({ location, onLocationChange, required = false }: LocationAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAutocomplete = async () => {
      if (!inputRef.current) return;

      setIsLoading(true);
      
      try {
        await loadGoogleMaps();
        
        if (isGoogleMapsAvailable() && inputRef.current && !autocompleteRef.current) {
          // Initialize Google Places Autocomplete
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['establishment', 'geocode'],
              fields: ['place_id', 'formatted_address', 'name', 'geometry']
            }
          );

          // Listen for place selection
          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.formatted_address) {
              onLocationChange(place.formatted_address);
            }
          });
        }
      } catch (error) {
        console.error('Failed to initialize Google Places Autocomplete:', error);
        toast({
          title: "Location search unavailable",
          description: "Using basic text input for location. Please enter the full address manually.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAutocomplete();

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [onLocationChange, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onLocationChange(e.target.value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        Location
      </label>
      <Input
        ref={inputRef}
        placeholder={isLoading ? "Loading location search..." : "Search for a place or enter address..."}
        value={location}
        onChange={handleInputChange}
        required={required}
        disabled={isLoading}
      />
      <p className="text-xs text-gray-500">
        {isGoogleMapsAvailable() 
          ? "Start typing to search for places and addresses"
          : "Please include the full address for better event discovery"
        }
      </p>
    </div>
  );
};

export default LocationAutocomplete;
