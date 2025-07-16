import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadGoogleMaps, isGoogleMapsAvailable, geocodeAddress, reverseGeocode, getPlaceSuggestions, getPlaceDetails } from '@/services/googleMapsService';

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationBarProps {
  onLocationChange?: (location: { lat: number; lng: number; address: string }) => void;
}

const LocationBar = ({ onLocationChange }: LocationBarProps) => {
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      setIsInitializing(true);
      try {
        await loadGoogleMaps();
      } catch (error) {
        console.error('Failed to initialize Google Maps:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeGoogleMaps();
  }, []);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (location.trim().length > 2) {
        try {
          const predictions = await getPlaceSuggestions(location);
          setSuggestions(predictions);
          setShowSuggestions(predictions.length > 0);
        } catch (error) {
          console.error('Error getting suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [location]);

  const handleSuggestionClick = async (prediction: google.maps.places.AutocompletePrediction) => {
    setLocation(prediction.description);
    setShowSuggestions(false);
    setIsSearching(true);

    try {
      const placeDetails = await getPlaceDetails(prediction.place_id);
      
      if (placeDetails && onLocationChange) {
        onLocationChange({
          lat: placeDetails.lat,
          lng: placeDetails.lng,
          address: placeDetails.formattedAddress
        });

        toast({
          title: "Location updated",
          description: `Searching near: ${placeDetails.formattedAddress}`,
        });
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      toast({
        title: "Error",
        description: "Failed to get location details",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const searchLocation = async (query: string) => {
    // Try Google Maps Geocoding first
    const googleResult = await geocodeAddress(query);
    if (googleResult) {
      return [{
        lat: googleResult.lat.toString(),
        lon: googleResult.lng.toString(),
        display_name: googleResult.formattedAddress
      }];
    }

    // Fallback to Nominatim
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search location');
    }
    
    return response.json();
  };

  const reverseGeocodeLocation = async (lat: number, lng: number): Promise<string> => {
    // Try Google Maps reverse geocoding first
    const googleResult = await reverseGeocode(lat, lng);
    if (googleResult) {
      return googleResult;
    }

    // Fallback to Nominatim
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'MeetdownApp/1.0'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      }
    } catch (error) {
      console.log('Reverse geocoding failed, using coordinates');
    }
    
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location.trim()) {
      toast({
        title: "Please enter a location",
        description: "Enter an address, zip code, or city to search.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const results = await searchLocation(location);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different address or city name.",
          variant: "destructive",
        });
        return;
      }

      const firstResult = results[0];
      const newLocation = {
        lat: parseFloat(firstResult.lat),
        lng: parseFloat(firstResult.lon),
        address: firstResult.display_name
      };

      console.log('Location found:', newLocation);
      
      if (onLocationChange) {
        onLocationChange(newLocation);
      }

      toast({
        title: "Location updated",
        description: `Searching near: ${firstResult.display_name}`,
      });

    } catch (error) {
      console.error('Error searching location:', error);
      toast({
        title: "Search failed",
        description: "Unable to search for location. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location detection.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const address = await reverseGeocodeLocation(latitude, longitude);
          
          const newLocation = {
            lat: latitude,
            lng: longitude,
            address: address
          };

          setLocation(address);
          
          if (onLocationChange) {
            onLocationChange(newLocation);
          }

          toast({
            title: "Location detected",
            description: "Using your current location for search.",
          });

          console.log('Current location detected:', newLocation);
          
        } catch (error) {
          console.error('Error processing current location:', error);
          
          const fallbackLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          };
          
          setLocation(fallbackLocation.address);
          
          if (onLocationChange) {
            onLocationChange(fallbackLocation);
          }

          toast({
            title: "Location detected",
            description: "Using your current coordinates for search.",
          });
        } finally {
          setIsSearching(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = "Unable to get your current location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please allow location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Your location is currently unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
        
        toast({
          title: "Location access error",
          description: errorMessage,
          variant: "destructive",
        });
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const isLoading = isSearching || isInitializing;

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <form onSubmit={handleLocationSubmit} className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={20} />
            <span className="text-sm font-medium">Location:</span>
          </div>
          <div className="flex-1 flex gap-2 relative">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder={isInitializing ? "Loading location search..." : "Enter address, zip code, or city..."}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (e.target.value.length > 2) {
                    setShowSuggestions(true);
                  }
                }}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                className="flex-1"
                disabled={isLoading}
              />
              
              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto"
                >
                  {suggestions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      type="button"
                      onClick={() => handleSuggestionClick(prediction)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                    >
                      <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {prediction.structured_formatting?.main_text || prediction.description}
                        </div>
                        {prediction.structured_formatting?.secondary_text && (
                          <div className="text-xs text-gray-500 truncate mt-1">
                            {prediction.structured_formatting.secondary_text}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCurrentLocation}
              disabled={isLoading}
              className="whitespace-nowrap"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <MapPin size={16} />
              )}
              Current
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin mr-1" />
              ) : (
                <Search size={16} className="mr-1" />
              )}
              Search
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationBar;
