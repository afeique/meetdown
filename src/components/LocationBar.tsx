
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';

const LocationBar = () => {
  const [location, setLocation] = useState('');

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for events near:', location);
    // TODO: Implement location-based event search
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
            />
            <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Search size={16} className="mr-1" />
              Search
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocationBar;
