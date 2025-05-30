
import { Calendar, MapPin, Users, Tag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  maxAttendees: number;
  distance: string;
  activity_tags?: string[];
}

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          {event.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-600 text-sm">{event.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <span>{event.date} at {event.time}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{event.distance} away</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Users size={16} />
          <span>{event.attendees}/{event.maxAttendees} attendees</span>
        </div>
        
        <div className="text-sm text-gray-600">
          <strong>Location:</strong> {event.location}
        </div>

        {/* Activity Tags */}
        {event.activity_tags && event.activity_tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag size={14} className="text-gray-500" />
            {event.activity_tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs bg-blue-100 text-blue-800"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          Join Event
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventCard;
