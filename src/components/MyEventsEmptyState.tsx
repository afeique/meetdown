
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

const MyEventsEmptyState = () => {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <CardTitle className="text-xl mb-2">No events created yet</CardTitle>
        <p className="text-gray-600 mb-6">
          Start creating events to build your community and connect with others.
        </p>
      </CardContent>
    </Card>
  );
};

export default MyEventsEmptyState;
