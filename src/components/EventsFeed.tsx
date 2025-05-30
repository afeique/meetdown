
import EventCard from './EventCard';

// Mock data for demonstration
const mockEvents = [
  {
    id: '1',
    title: 'Coffee & Code Meetup',
    description: 'Join us for a casual coding session with coffee and great conversations.',
    date: 'June 15, 2024',
    time: '10:00 AM',
    location: 'Central Coffee House, Downtown',
    attendees: 8,
    maxAttendees: 15,
    distance: '0.5 miles'
  },
  {
    id: '2',
    title: 'Weekend Hiking Adventure',
    description: 'Explore beautiful trails and enjoy nature with fellow hiking enthusiasts.',
    date: 'June 17, 2024',
    time: '8:00 AM',
    location: 'Mountain View Trail Head',
    attendees: 12,
    maxAttendees: 20,
    distance: '2.3 miles'
  },
  {
    id: '3',
    title: 'Board Game Night',
    description: 'Fun evening of board games, snacks, and making new friends.',
    date: 'June 18, 2024',
    time: '7:00 PM',
    location: 'Game Lounge, Main Street',
    attendees: 6,
    maxAttendees: 12,
    distance: '1.1 miles'
  },
  {
    id: '4',
    title: 'Photography Walk',
    description: 'Capture the beauty of the city while meeting other photography enthusiasts.',
    date: 'June 20, 2024',
    time: '6:00 PM',
    location: 'City Park & Gardens',
    attendees: 4,
    maxAttendees: 10,
    distance: '0.8 miles'
  }
];

const EventsFeed = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Nearby Events
        </h2>
        <p className="text-gray-600">
          Discover and join events happening near you
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      
      {mockEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No events found in your area. Try searching a different location!
          </p>
        </div>
      )}
    </div>
  );
};

export default EventsFeed;
