
-- Update the handle_email_update function to remove phone field references
CREATE OR REPLACE FUNCTION public.handle_email_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- If email is being updated and it's different from the old value
  IF NEW.email IS DISTINCT FROM OLD.email AND NEW.email IS NOT NULL THEN
    NEW.email_verified = FALSE;
  END IF;
  
  RETURN NEW;
END;
$$;
