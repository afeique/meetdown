
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

      // Load Google Maps JavaScript API
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
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

export const isGoogleMapsAvailable = (): boolean => {
  return isGoogleMapsLoaded && typeof window.google !== 'undefined' && !!window.google.maps;
};
