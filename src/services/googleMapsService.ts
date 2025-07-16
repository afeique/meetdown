
import { supabase } from '@/integrations/supabase/client';

let isGoogleMapsLoaded = false;
let googleMapsPromise: Promise<void> | null = null;

export const loadGoogleMaps = async (): Promise<void> => {
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise(async (resolve, reject) => {
    try {
      // Get the API key from Supabase function
      const { data } = await supabase.functions.invoke('get-google-maps-key');
      
      if (!data?.apiKey) {
        throw new Error('Google Maps API key not available');
      }

      // Load Google Maps JavaScript API with async loading
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        isGoogleMapsLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google Maps API'));
      };
      
      document.head.appendChild(script);
    } catch (error) {
      console.error('Error loading Google Maps:', error);
      reject(error);
    }
  });

  return googleMapsPromise;
};

// Geocoding service using Google Maps Geocoding API
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null> => {
  try {
    await loadGoogleMaps();
    
    if (!isGoogleMapsAvailable()) {
      throw new Error('Google Maps not available');
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      
      geocoder.geocode({ address }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address
          });
        } else {
          console.error('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error in geocoding:', error);
    return null;
  }
};

// Reverse geocoding service
export const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
  try {
    await loadGoogleMaps();
    
    if (!isGoogleMapsAvailable()) {
      throw new Error('Google Maps not available');
    }

    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = new window.google.maps.LatLng(lat, lng);
      
      geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          console.error('Reverse geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
};

export const isGoogleMapsAvailable = (): boolean => {
  return isGoogleMapsLoaded && typeof window.google !== 'undefined' && !!window.google.maps;
};
