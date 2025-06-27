
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, Calendar } from 'lucide-react';

interface DateTimePreferences {
  dateFormat: 'month-day' | 'full-date' | 'short-date';
  timeFormat: '12-hour' | '24-hour';
  showTimezone: boolean;
}

const DateTimePreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<DateTimePreferences>({
    dateFormat: 'month-day',
    timeFormat: '12-hour',
    showTimezone: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('date_time_preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data?.date_time_preferences) {
        setPreferences(data.date_time_preferences as unknown as DateTimePreferences);
      }
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          date_time_preferences: preferences as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Preferences saved!",
        description: "Your date and time preferences have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (key: keyof DateTimePreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-gray-500">Loading preferences...</div>
        </CardContent>
      </Card>
    );
  }

  // Preview examples
  const now = new Date();
  const previewDate = now.toLocaleDateString('en-US', 
    preferences.dateFormat === 'month-day' 
      ? { month: 'long', day: 'numeric' }
      : preferences.dateFormat === 'short-date'
      ? { month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'long', day: 'numeric', year: 'numeric' }
  );
  
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: preferences.timeFormat === '12-hour'
  };
  
  if (preferences.showTimezone) {
    timeOptions.timeZoneName = 'short';
  }
  
  const previewTime = now.toLocaleTimeString('en-US', timeOptions);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Date & Time Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Format */}
        <div className="space-y-2">
          <Label htmlFor="dateFormat">Date Format</Label>
          <Select 
            value={preferences.dateFormat} 
            onValueChange={(value) => updatePreference('dateFormat', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month-day">Month Day (June 23)</SelectItem>
              <SelectItem value="short-date">Short Date (Jun 23, 2024)</SelectItem>
              <SelectItem value="full-date">Full Date (June 23, 2024)</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-gray-500">Preview: {previewDate}</div>
        </div>

        {/* Time Format */}
        <div className="space-y-2">
          <Label htmlFor="timeFormat">Time Format</Label>
          <Select 
            value={preferences.timeFormat} 
            onValueChange={(value) => updatePreference('timeFormat', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12-hour">12-hour (2:30 PM)</SelectItem>
              <SelectItem value="24-hour">24-hour (14:30)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Show Timezone */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="showTimezone">Show Timezone</Label>
            <div className="text-sm text-gray-500">
              Display timezone abbreviation (EST, PST, etc.)
            </div>
          </div>
          <Switch
            id="showTimezone"
            checked={preferences.showTimezone}
            onCheckedChange={(checked) => updatePreference('showTimezone', checked)}
          />
        </div>

        {/* Time Preview */}
        <div className="p-3 bg-gray-50 rounded-md">
          <div className="text-sm font-medium text-gray-700 mb-1">Preview:</div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{previewDate} at {previewTime}</span>
          </div>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DateTimePreferences;
