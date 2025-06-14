
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import EventsFeed from '@/components/EventsFeed';
import PersonalizedEventsFeed from '@/components/PersonalizedEventsFeed';
import FollowingEventsFeed from '@/components/FollowingEventsFeed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Plus } from 'lucide-react';
import CreateEventForm from '@/components/CreateEventForm';
import LocationBar from '@/components/LocationBar';
import EventFilters, { EventFilters as EventFiltersType } from '@/components/EventFilters';
import LogoutButton from '@/components/LogoutButton';
import UserProfileHeader from '@/components/UserProfileHeader';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState<EventFiltersType>({
    maxCoverCharge: 50,
    noReservationRequired: false,
    freeEventsOnly: false,
    selectedTags: []
  });
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);

  // Fetch tag names when selected tags change
  useEffect(() => {
    if (filters.selectedTags.length > 0) {
      fetchTagNames();
    } else {
      setSelectedTagNames([]);
    }
  }, [filters.selectedTags]);

  const fetchTagNames = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_tags')
        .select('name')
        .in('id', filters.selectedTags);

      if (error) throw error;
      setSelectedTagNames(data?.map(tag => tag.name) || []);
    } catch (error) {
      console.error('Error fetching tag names:', error);
    }
  };

  const handleEventCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFiltersChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="meetdown" 
                className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => navigate('/')}
              />
              <UserProfileHeader />
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/my-events'}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                My Events
              </Button>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <LocationBar />
            
            <CreateEventForm onEventCreated={handleEventCreated} />

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Events</TabsTrigger>
                <TabsTrigger value="personalized">For You</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <EventsFeed 
                  key={`all-${refreshKey}`} 
                  filters={filters}
                  selectedTagNames={selectedTagNames}
                />
              </TabsContent>
              
              <TabsContent value="personalized" className="space-y-4">
                <PersonalizedEventsFeed 
                  key={`personalized-${refreshKey}`}
                  filters={filters}
                  selectedTagNames={selectedTagNames}
                />
              </TabsContent>
              
              <TabsContent value="following" className="space-y-4">
                <FollowingEventsFeed 
                  key={`following-${refreshKey}`}
                  filters={filters}
                  selectedTagNames={selectedTagNames}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <EventFilters 
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
