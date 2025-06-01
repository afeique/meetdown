
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LogoutButton from "@/components/LogoutButton";
import LocationBar from "@/components/LocationBar";
import PersonalizedEventsFeed from "@/components/PersonalizedEventsFeed";
import { Button } from "@/components/ui/button";
import { User, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { capitalizeFirstLetter } from "@/lib/nameUtils";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [userFirstName, setUserFirstName] = useState<string | null>(null);

  useEffect(() => {
    // Check if geolocation is supported and get user's location
    if (navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state);
        if (result.state === 'granted') {
          getCurrentLocation();
        }
      });
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', user?.id)
        .single();

      if (error) {
        console.log('Error fetching profile:', error.message);
        return;
      }

      if (profile?.first_name) {
        setUserFirstName(profile.first_name);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const getCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationPermission('granted');
      },
      (error) => {
        console.error('Error getting location:', error);
        setLocationPermission('denied');
        toast({
          title: "Location access denied",
          description: "Enable location access for better event recommendations.",
          variant: "default",
        });
      }
    );
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      getCurrentLocation();
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
    }
  };

  const getWelcomeText = () => {
    if (userFirstName) {
      return `Welcome back, ${capitalizeFirstLetter(userFirstName)}!`;
    }
    if (user?.email) {
      return `Welcome back, ${user.email.split('@')[0]}!`;
    }
    return 'Welcome back!';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with logout button and profile link */}
      <div className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
          meetdown
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <User size={16} />
            Profile
          </Button>
          <LogoutButton />
        </div>
      </div>

      {/* Location permission prompt */}
      {locationPermission === 'prompt' && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mx-6 mb-4">
          <div className="flex items-center">
            <MapPin className="text-blue-400 mr-3" size={20} />
            <div className="flex-1">
              <p className="text-blue-800 font-medium">Enable location for better recommendations</p>
              <p className="text-blue-600 text-sm">We'll show you events happening near you</p>
            </div>
            <Button 
              size="sm" 
              onClick={requestLocationPermission}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Enable Location
            </Button>
          </div>
        </div>
      )}

      {/* Location input bar */}
      <LocationBar />

      {/* Welcome message */}
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {getWelcomeText()}
          </h2>
          <p className="text-lg text-gray-600">
            Are you down to meet? Check out these personalized events for you.
          </p>
        </div>
      </div>

      {/* Personalized Events feed */}
      <PersonalizedEventsFeed userLocation={userLocation} />
    </div>
  );
};

export default Index;
