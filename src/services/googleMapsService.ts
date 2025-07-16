
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
      console.log('Loading Google Maps API...');
      // Get the API key from Supabase function
      const { data, error } = await supabase.functions.invoke('get-google-maps-key');
      
      console.log('Google Maps API key response:', { data, error });
      
      if (error) {
        console.error('Error getting API key:', error);
        throw new Error(`Failed to get API key: ${error.message}`);
      }
      
      if (!data?.apiKey) {
        console.error('No API key in response:', data);
        throw new Error('Google Maps API key not available');
      }

      console.log('API key obtained, loading script...');
      // Load Google Maps JavaScript API with async loading
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('Google Maps API script loaded successfully');
        isGoogleMapsLoaded = true;
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Google Maps API script:', error);
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

// Places Autocomplete Service for realtime suggestions - Using Nominatim as fallback
export const getPlaceSuggestions = async (input: string): Promise<any[]> => {
  try {
    console.log('getPlaceSuggestions called with input:', input);
    
    if (!input.trim()) {
      console.log('Input is empty');
      return [];
    }

    // Try Google Maps first if available
    if (isGoogleMapsAvailable()) {
      try {
        console.log('Trying Google Maps Geocoder...');
        const geocoderPromise = new Promise<any[]>((resolve) => {
          const geocoder = new window.google.maps.Geocoder();
          
          geocoder.geocode(
            { 
              address: input,
              region: 'US'
            },
            (results, status) => {
              console.log('Geocoder response:', { results, status });
              if (status === window.google.maps.GeocoderStatus.OK && results) {
                const suggestions = results.slice(0, 5).map((result, index) => ({
                  place_id: result.place_id || `geocoder_${index}`,
                  description: result.formatted_address,
                  structured_formatting: {
                    main_text: result.formatted_address.split(',')[0],
                    secondary_text: result.formatted_address.split(',').slice(1).join(',').trim()
                  },
                  geometry: result.geometry
                }));
                console.log('Returning Google suggestions:', suggestions);
                resolve(suggestions);
              } else {
                console.log('Google Geocoder failed, status:', status);
                resolve([]);
              }
            }
          );
        });

        // Add a timeout to prevent hanging
        const timeoutPromise = new Promise<any[]>((resolve) => {
          setTimeout(() => {
            console.log('Google Maps timeout, falling back to Nominatim');
            resolve([]);
          }, 2000);
        });

        const googleResults = await Promise.race([geocoderPromise, timeoutPromise]);
        if (googleResults.length > 0) {
          return googleResults;
        }
      } catch (error) {
        console.error('Google Maps error:', error);
      }
    }

    // Fallback to Nominatim
    console.log('Using Nominatim for suggestions...');
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(input)}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MeetdownApp/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Nominatim request failed');
    }

    const results = await response.json();
    console.log('Nominatim results:', results);

    const suggestions = results.map((result: any, index: number) => ({
      place_id: `nominatim_${result.place_id || index}`,
      description: result.display_name,
      structured_formatting: {
        main_text: result.display_name.split(',')[0],
        secondary_text: result.display_name.split(',').slice(1).join(',').trim()
      },
      geometry: {
        location: {
          lat: () => parseFloat(result.lat),
          lng: () => parseFloat(result.lon)
        }
      },
      nominatim_data: result
    }));

    console.log('Returning Nominatim suggestions:', suggestions);
    return suggestions;
  } catch (error) {
    console.error('Error getting place suggestions:', error);
    return [];
  }
};

// Get place details from place_id or use geocoder result
export const getPlaceDetails = async (placeId: string, geocoderResult?: any): Promise<{ lat: number; lng: number; formattedAddress: string } | null> => {
  try {
    // Handle Nominatim results
    if (placeId.startsWith('nominatim_') && geocoderResult?.nominatim_data) {
      const data = geocoderResult.nominatim_data;
      return {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        formattedAddress: data.display_name
      };
    }

    // Handle direct geometry results (Google Maps or Nominatim)
    if (geocoderResult && geocoderResult.geometry?.location) {
      return {
        lat: typeof geocoderResult.geometry.location.lat === 'function' 
          ? geocoderResult.geometry.location.lat() 
          : geocoderResult.geometry.location.lat,
        lng: typeof geocoderResult.geometry.location.lng === 'function' 
          ? geocoderResult.geometry.location.lng() 
          : geocoderResult.geometry.location.lng,
        formattedAddress: geocoderResult.description || geocoderResult.formatted_address || ''
      };
    }

    // Try Google Maps if available
    if (isGoogleMapsAvailable()) {
      await loadGoogleMaps();

      // If we have a geocoder result, use it directly
      if (geocoderResult && geocoderResult.geometry?.location) {
        return {
          lat: geocoderResult.geometry.location.lat(),
          lng: geocoderResult.geometry.location.lng(),
          formattedAddress: geocoderResult.formatted_address || ''
        };
      }

      // Fallback to Places Service if we have a real place_id
      if (placeId && !placeId.startsWith('geocoder_') && !placeId.startsWith('nominatim_')) {
        return new Promise((resolve) => {
          const service = new window.google.maps.places.PlacesService(document.createElement('div'));
          
          service.getDetails(
            {
              placeId: placeId,
              fields: ['geometry', 'formatted_address']
            },
            (place, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry?.location) {
                resolve({
                  lat: place.geometry.location.lat(),
                  lng: place.geometry.location.lng(),
                  formattedAddress: place.formatted_address || ''
                });
              } else {
                resolve(null);
              }
            }
          );
        });
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting place details:', error);
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
