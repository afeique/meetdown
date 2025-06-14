
-- Add new columns for storing country code and phone number separately
ALTER TABLE profiles 
ADD COLUMN country_code text DEFAULT '+1',
ADD COLUMN phone_number text;

-- Migrate existing phone data to new format
UPDATE profiles 
SET 
  country_code = CASE 
    WHEN phone LIKE '+%' THEN 
      CASE 
        WHEN phone LIKE '+1%' THEN '+1'
        WHEN phone LIKE '+44%' THEN '+44'
        WHEN phone LIKE '+33%' THEN '+33'
        WHEN phone LIKE '+49%' THEN '+49'
        ELSE '+1'
      END
    ELSE '+1'
  END,
  phone_number = CASE 
    WHEN phone LIKE '+1%' THEN SUBSTRING(phone FROM 3)
    WHEN phone LIKE '+44%' THEN SUBSTRING(phone FROM 4)
    WHEN phone LIKE '+33%' THEN SUBSTRING(phone FROM 4)
    WHEN phone LIKE '+49%' THEN SUBSTRING(phone FROM 4)
    WHEN phone LIKE '+%' THEN SUBSTRING(phone FROM POSITION(' ' IN phone) + 1)
    ELSE phone
  END
WHERE phone IS NOT NULL;

-- Create a function to get the full phone number for SMS
CREATE OR REPLACE FUNCTION get_full_phone_number(country_code text, phone_number text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN country_code IS NULL OR phone_number IS NULL THEN NULL
    ELSE country_code || phone_number
  END;
$$;

-- Add a computed column for backward compatibility
ALTER TABLE profiles 
ADD COLUMN full_phone_number text GENERATED ALWAYS AS (
  CASE 
    WHEN country_code IS NOT NULL AND phone_number IS NOT NULL 
    THEN country_code || phone_number
    ELSE NULL
  END
) STORED;
