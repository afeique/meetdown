
import { EventFilters } from '@/components/EventFilters';

interface FollowingEvent {
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
  creator_name?: string;
}

export const filterFollowingEvents = (events: FollowingEvent[], filters: EventFilters, tagNames: string[]) => {
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
    
    // Filter by tags - if tags are selected, event must have at least one matching tag
    if (tagNames.length > 0) {
      const hasMatchingTag = event.activity_tags.some(tag => 
        tagNames.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  });
};
