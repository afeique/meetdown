
-- Add the new phone field with validation
ALTER TABLE profiles 
ADD COLUMN phone text;

-- Create a function to validate 10-digit US/Canada phone numbers
CREATE OR REPLACE FUNCTION is_valid_us_canada_phone(phone_input text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check if input is exactly 10 digits and doesn't start with 0
  RETURN phone_input ~ '^[1-9][0-9]{9}$';
END;
$$;

-- Add a check constraint to ensure valid phone numbers
ALTER TABLE profiles 
ADD CONSTRAINT valid_phone_format 
CHECK (phone IS NULL OR is_valid_us_canada_phone(phone));

-- Add constraint to phone_verification_tokens
ALTER TABLE phone_verification_tokens 
ADD CONSTRAINT valid_verification_phone_format 
CHECK (is_valid_us_canada_phone(phone));
