
export const parseDistance = (distance: string): number => {
  const match = distance.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

export const calculateDistance = (lat1?: number, lng1?: number, lat2?: number, lng2?: number): string => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return 'Unknown distance';
  
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  
  return `${distance.toFixed(1)} miles`;
};

export const sortEventsByDateAndDistance = <T extends { date: string; distance?: string }>(events: T[]): T[] => {
  return [...events].sort((a, b) => {
    // First, sort by date
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    
    // If dates are the same, sort by distance
    const distanceA = parseDistance(a.distance || '0');
    const distanceB = parseDistance(b.distance || '0');
    
    return distanceA - distanceB;
  });
};
