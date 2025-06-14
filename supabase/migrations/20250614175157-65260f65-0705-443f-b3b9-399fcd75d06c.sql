
-- Add sms_notifications_enabled column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN sms_notifications_enabled boolean DEFAULT false;
