
-- Drop the country_code column with CASCADE to remove dependencies
ALTER TABLE profiles DROP COLUMN country_code CASCADE;

-- Recreate the full_phone_number column assuming +1 country code
ALTER TABLE profiles 
ADD COLUMN full_phone_number text GENERATED ALWAYS AS (
  CASE 
    WHEN phone_number IS NOT NULL 
    THEN '+1' || phone_number
    ELSE NULL
  END
) STORED;

-- Update the get_full_phone_number function to always use +1
CREATE OR REPLACE FUNCTION get_full_phone_number(phone_number text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN phone_number IS NULL THEN NULL
    ELSE '+1' || phone_number
  END;
$$;
