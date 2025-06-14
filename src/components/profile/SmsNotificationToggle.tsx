
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SmsNotificationToggleProps {
  isPhoneVerified: boolean;
  initialEnabled: boolean | null;
}

const SmsNotificationToggle = ({ isPhoneVerified, initialEnabled }: SmsNotificationToggleProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);
  const [updatingSmsPrefs, setUpdatingSmsPrefs] = useState(false);

  useEffect(() => {
    if (initialEnabled !== null) {
      setSmsNotificationsEnabled(initialEnabled || false);
    }
  }, [initialEnabled]);

  const handleSmsNotificationChange = async (enabled: boolean) => {
    if (!user) return;
    
    setUpdatingSmsPrefs(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ sms_notifications_enabled: enabled })
        .eq('id', user.id);

      if (error) throw error;

      setSmsNotificationsEnabled(enabled);
      toast({
        title: enabled ? "SMS notifications enabled" : "SMS notifications disabled",
        description: enabled 
          ? "You'll receive event notifications via SMS" 
          : "You won't receive SMS notifications anymore",
      });
    } catch (error: any) {
      toast({
        title: "Error updating SMS preferences",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdatingSmsPrefs(false);
    }
  };

  if (!isPhoneVerified) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 mt-3">
      <Checkbox
        id="sms-notifications"
        checked={smsNotificationsEnabled}
        onCheckedChange={handleSmsNotificationChange}
        disabled={updatingSmsPrefs}
      />
      <label
        htmlFor="sms-notifications"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Allow event SMS notifications
      </label>
    </div>
  );
};

export default SmsNotificationToggle;
