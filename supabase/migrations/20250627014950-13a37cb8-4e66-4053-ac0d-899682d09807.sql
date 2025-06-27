
-- Add date_time_preferences column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN date_time_preferences JSONB DEFAULT '{"dateFormat": "month-day", "timeFormat": "12-hour", "showTimezone": true}';
