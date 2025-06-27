
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
          
          // Reverse geocode to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          
          if (response.ok) {
            const data = await response.json();
            const newLocation = {
              lat: latitude,
              lng: longitude,
              address: data.display_name || `${latitude}, ${longitude}`
            };

            setLocation(data.display_name || '');
            
            if (onLocationChange) {
              onLocationChange(newLocation);
            }

            toast({
              title: "Location detected",
              description: "Using your current location for search.",
            });
          }
        } catch (error) {
          console.error('Error getting current location:', error);
          toast({
            title: "Location error",
            description: "Unable to get your current location.",
            variant: "destructive",
          });
        } finally {
          setIsSearching(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast({
          title: "Location access denied",
          description: "Please allow location access or enter an address manually.",
          variant: "destructive",
        });
        setIsSearching(false);
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
