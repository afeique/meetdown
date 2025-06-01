
import { EventFilters } from '@/components/EventFilters';

export const getDefaultFilters = (): EventFilters => ({
  maxCoverCharge: 50,
  noReservationRequired: false,
  freeEventsOnly: false,
  selectedTags: []
});

export const resetFilters = (): EventFilters => getDefaultFilters();
