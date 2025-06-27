
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchLocation = async (query: string): Promise<LocationResult[]> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    
    if (!response.ok) {
      throw new Error('Failed to search location');
    }
    
    return response.json();
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Try the primary reverse geocoding service
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
      console.log('Primary reverse geocoding failed, using coordinates');
    }
    
    // Fallback to coordinates if reverse geocoding fails
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
          
          // Use our improved reverse geocoding function
          const address = await reverseGeocode(latitude, longitude);
          
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
          
          // Even if reverse geocoding fails, we can still use the coordinates
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

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <form onSubmit={handleLocationSubmit} className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={20} />
            <span className="text-sm font-medium">Location:</span>
          </div>
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              placeholder="Enter address, zip code, or city..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
              disabled={isSearching}
            />
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCurrentLocation}
              disabled={isSearching}
              className="whitespace-nowrap"
            >
              {isSearching ? (
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
              disabled={isSearching}
            >
              {isSearching ? (
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
