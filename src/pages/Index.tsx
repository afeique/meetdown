
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TopBar from '@/components/TopBar';
import LocationBar from '@/components/LocationBar';
import EventsFeed from '@/components/EventsFeed';
import PersonalizedEventsFeed from '@/components/PersonalizedEventsFeed';
import FollowingEventsFeed from '@/components/FollowingEventsFeed';
import EventFiltersComponent, { EventFilters } from '@/components/EventFilters';
import { useLocation } from '@/contexts/LocationContext';

const Index = () => {
  const { location, setLocation } = useLocation();
  const [filters, setFilters] = useState<EventFilters>({
    maxCoverCharge: 50,
    noReservationRequired: false,
    freeEventsOnly: false,
    selectedTags: []
  });

  const handleLocationChange = (newLocation: { lat: number; lng: number; address: string }) => {
    setLocation(newLocation);
    console.log('Location updated in Index:', newLocation);
  };

  const selectedTagNames = filters.selectedTags;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <LocationBar onLocationChange={handleLocationChange} />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <EventFiltersComponent 
          filters={filters}
          onFiltersChange={setFilters}
        />
        
        <Tabs defaultValue="nearby" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="nearby">Nearby</TabsTrigger>
            <TabsTrigger value="personalized">For You</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="nearby">
            <EventsFeed 
              filters={filters}
              selectedTagNames={selectedTagNames}
            />
          </TabsContent>
          
          <TabsContent value="personalized">
            <PersonalizedEventsFeed 
              userLocation={location || undefined}
              filters={filters}
              selectedTagNames={selectedTagNames}
            />
          </TabsContent>
          
          <TabsContent value="following">
            <FollowingEventsFeed 
              userLocation={location || undefined}
              filters={filters}
              selectedTagNames={selectedTagNames}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
