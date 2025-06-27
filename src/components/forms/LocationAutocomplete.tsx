
import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

interface LocationAutocompleteProps {
  location: string;
  onLocationChange: (value: string) => void;
  required?: boolean;
}

const LocationAutocomplete = ({ location, onLocationChange, required = false }: LocationAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    const initializeAutocomplete = async () => {
      try {
        // Get the Google Maps API key from Supabase secrets
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log('No session found, using fallback input');
          setApiError(true);
          return;
        }

        // Call edge function to get API key (since we can't access secrets directly in frontend)
        const { data: apiKeyData, error: apiKeyError } = await supabase.functions.invoke('get-google-maps-key');
        
        if (apiKeyError || !apiKeyData?.apiKey) {
          console.log('Could not retrieve Google Maps API key:', apiKeyError);
          setApiError(true);
          return;
        }

        const loader = new Loader({
          apiKey: apiKeyData.apiKey,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        
        if (inputRef.current && window.google) {
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ['establishment', 'geocode'],
              fields: ['place_id', 'geometry', 'name', 'formatted_address']
            }
          );

          autocompleteRef.current.addListener('place_changed', () => {
            const place = autocompleteRef.current?.getPlace();
            if (place && place.formatted_address) {
              onLocationChange(place.formatted_address);
            }
          });
        }
        
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setApiError(true);
      }
    };

    initializeAutocomplete();

    return () => {
      if (autocompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onLocationChange]);

  // Fallback to regular input if Google Maps fails to load
  if (apiError) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          Location
        </label>
        <Input
          placeholder="Enter event location"
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          required={required}
        />
        <p className="text-xs text-amber-600">
          Location autocomplete unavailable. Please enter address manually.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-1">
        <MapPin className="h-4 w-4" />
        Location
      </label>
      <Input
        ref={inputRef}
        placeholder="Enter event location"
        value={location}
        onChange={(e) => onLocationChange(e.target.value)}
        required={required}
      />
      {!isLoaded && (
        <p className="text-xs text-gray-500">Loading location suggestions...</p>
      )}
    </div>
  );
};

export default LocationAutocomplete;
