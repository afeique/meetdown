
import { EventFilters } from '@/components/EventFilters';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  max_attendees: number;
  cover_charge: number;
  requires_reservation: boolean;
  banner_url?: string;
  creator_id: string;
  attendees?: number;
  distance?: string;
  activity_tags: string[];
  is_registered?: boolean;
}

export const filterEvents = (events: Event[], filters: EventFilters): Event[] => {
  return events.filter(event => {
    // Filter by cover charge
    if (filters.freeEventsOnly && event.cover_charge > 0) {
      return false;
    }
    if (!filters.freeEventsOnly && event.cover_charge > filters.maxCoverCharge) {
      return false;
    }
    
    // Filter by reservation requirement
    if (filters.noReservationRequired && event.requires_reservation) {
      return false;
    }
    
    return true;
  });
};

export const getDefaultFilters = (): EventFilters => ({
  maxCoverCharge: 50,
  noReservationRequired: false,
  freeEventsOnly: false,
  selectedTags: []
});
