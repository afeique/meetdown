
import { Calendar, MapPin, Users, Tag, DollarSign, Clock } from 'lucide-react';
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
  attendees?: number;
  max_attendees: number;
  distance?: string;
  activity_tags?: string[];
  cover_charge?: number;
  requires_reservation?: boolean;
  is_registered?: boolean;
}

interface EventCardProps {
  event: Event;
  onJoin?: (eventId: string) => void;
  onLeave?: (eventId: string) => void;
}

const EventCard = ({ event, onJoin, onLeave }: EventCardProps) => {
  const handleButtonClick = () => {
    if (event.is_registered && onLeave) {
      onLeave(event.id);
    } else if (!event.is_registered && onJoin) {
      onJoin(event.id);
    }
  };

  const isEventFull = (event.attendees || 0) >= event.max_attendees;

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
          {event.distance && (
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span>{event.distance} away</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{event.attendees || 0}/{event.max_attendees} attendees</span>
          </div>
          
          {(event.cover_charge !== undefined && event.cover_charge > 0) && (
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign size={16} />
              <span>${event.cover_charge}</span>
            </div>
          )}
          
          {event.cover_charge === 0 && (
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              FREE
            </Badge>
          )}
        </div>
        
        <div className="text-sm text-gray-600">
          <strong>Location:</strong> {event.location}
        </div>

        {event.requires_reservation && (
          <div className="flex items-center gap-1 text-sm text-orange-600">
            <Clock size={14} />
            <span>Reservation required</span>
          </div>
        )}

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
        
        <Button 
          className={`w-full ${
            event.is_registered 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
          }`}
          onClick={handleButtonClick}
          disabled={!event.is_registered && isEventFull}
        >
          {event.is_registered 
            ? 'Leave Event' 
            : isEventFull 
              ? 'Event Full' 
              : 'Join Event'
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventCard;
