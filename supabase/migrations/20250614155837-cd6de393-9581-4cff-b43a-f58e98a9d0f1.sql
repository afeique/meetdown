
-- Create table for storing phone verification tokens
CREATE TABLE public.phone_verification_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  phone TEXT NOT NULL,
  token TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Add Row Level Security
ALTER TABLE public.phone_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for phone verification tokens
CREATE POLICY "Users can view their own phone verification tokens" 
  ON public.phone_verification_tokens 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own phone verification tokens" 
  ON public.phone_verification_tokens 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phone verification tokens" 
  ON public.phone_verification_tokens 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_phone_verification_tokens_user_id ON public.phone_verification_tokens(user_id);
CREATE INDEX idx_phone_verification_tokens_token ON public.phone_verification_tokens(token);
