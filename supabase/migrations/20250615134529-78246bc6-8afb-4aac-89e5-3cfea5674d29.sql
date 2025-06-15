
-- Remove phone verification tokens table
DROP TABLE IF EXISTS public.phone_verification_tokens CASCADE;

-- Remove phone-related columns from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS phone CASCADE,
DROP COLUMN IF EXISTS phone_verified CASCADE,
DROP COLUMN IF EXISTS sms_notifications_enabled CASCADE;

-- Drop the phone validation function
DROP FUNCTION IF EXISTS public.is_valid_us_canada_phone(text);

-- Remove any triggers related to phone verification
DROP TRIGGER IF EXISTS handle_phone_update ON public.profiles;
