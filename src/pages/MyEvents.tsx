import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import EventCard from '@/components/EventCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Plus, ChevronDown, MapPin, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import UserProfileHeader from '@/components/UserProfileHeader';
import MyEventsCreateForm from '@/components/MyEventsCreateForm';
import EventEditForm from '@/components/EventEditForm';
import { transformEventData } from '@/utils/eventDataTransform';
import { useEventRegistration } from '@/hooks/useEventRegistration';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  max_attendees: number;
  cover_charge: number;
  requires_reservation: boolean;
  banner_url?: string;
  creator_id: string;
  attendees?: number;
  is_registered?: boolean;
}

interface DateTimePreferences {
  dateFormat: 'month-day' | 'full-date' | 'short-date';
  timeFormat: '12-hour' | '24-hour';
  showTimezone: boolean;
}

const MyEvents = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [dateTimePrefs, setDateTimePrefs] = useState<DateTimePreferences>({
    dateFormat: 'month-day',
    timeFormat: '12-hour',
    showTimezone: true
  });

  // Add event registration hooks
  const { handleJoinEvent, handleLeaveEvent } = useEventRegistration(
    events, 
    setEvents, 
    user?.id
  );

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('date_time_preferences')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data?.date_time_preferences) {
          // Safely parse the preferences with validation
          try {
            const prefs = data.date_time_preferences as unknown as DateTimePreferences;
            if (prefs && typeof prefs === 'object' && !Array.isArray(prefs)) {
              setDateTimePrefs({
                dateFormat: prefs.dateFormat || 'month-day',
                timeFormat: prefs.timeFormat || '12-hour',
                showTimezone: prefs.showTimezone !== undefined ? prefs.showTimezone : true
              });
            }
          } catch (parseError) {
            console.error('Error parsing date time preferences:', parseError);
          }
        }
      } catch (error: any) {
        console.error('Error fetching user preferences:', error);
      }
    };

    fetchUserPreferences();
  }, [user]);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!user) return;

      try {
        // Fetch events created by the user
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('creator_id', user.id)
          .order('date', { ascending: true });

        if (eventsError) throw eventsError;

        // Fetch attendee counts and registration status for each event
        const eventsWithAttendees = await Promise.all(
          (eventsData || []).map(async (event) => {
            const { count } = await supabase
              .from('event_registrations')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id);

            // Check if current user is registered for this event
            const { data: userRegistration } = await supabase
              .from('event_registrations')
              .select('id')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .single();

            // Transform the event data with user's date/time preferences
            const transformedEvent = transformEventData({
              ...event,
              event_registrations: userRegistration ? [{ user_id: user.id }] : []
            }, undefined, user.id, dateTimePrefs);

            return {
              ...transformedEvent,
              attendees: count || 0,
              is_registered: !!userRegistration,
            };
          })
        );

        setEvents(eventsWithAttendees);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error loading events",
          description: error.message || "Failed to load your events. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, [user, toast, dateTimePrefs]);

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('creator_id', user?.id); // Extra safety check

      if (error) throw error;

      setEvents(events.filter(event => event.id !== eventId));
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error deleting event",
        description: error.message || "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
  };

  const handleEventUpdated = () => {
    setEditingEvent(null);
    // Refresh the events list
    window.location.reload();
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Feed
              </Button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  My Events
                </h1>
                <p className="text-gray-600">Events you've created</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <UserProfileHeader />
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white">
                  <DropdownMenuItem 
                    onClick={() => navigate('/going')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="h-4 w-4" />
                    Going
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/my-events')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <MapPin className="h-4 w-4" />
                    My Events
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Show edit form if editing */}
        {editingEvent ? (
          <div className="mb-6">
            <EventEditForm
              event={editingEvent}
              onEventUpdated={handleEventUpdated}
              onCancel={handleCancelEdit}
            />
          </div>
        ) : (
          <>
            {/* Add Create Event Form */}
            <div className="mb-6">
              <MyEventsCreateForm onEventCreated={() => window.location.reload()} />
            </div>

            {events.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <CardTitle className="text-xl mb-2">No events created yet</CardTitle>
                  <p className="text-gray-600 mb-6">
                    Start creating events to build your community and connect with others.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <div key={event.id} className="relative">
                    <EventCard
                      event={event}
                      onJoin={handleJoinEvent}
                      onLeave={handleLeaveEvent}
                    />
                    <div className="absolute top-2 right-2 z-10 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                        className="opacity-80 hover:opacity-100"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="opacity-80 hover:opacity-100"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
