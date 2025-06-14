
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhoneVerifyRequest {
  phone: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const { phone, token: verificationToken }: PhoneVerifyRequest = await req.json();

    if (!phone || !verificationToken) {
      return new Response(JSON.stringify({ error: 'Phone number and verification code are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if verification token exists and is valid
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('phone_verification_tokens')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone', phone)
      .eq('token', verificationToken)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: 'Invalid or expired verification code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Mark token as verified
    const { error: updateTokenError } = await supabaseClient
      .from('phone_verification_tokens')
      .update({ verified: true })
      .eq('id', tokenData.id);

    if (updateTokenError) {
      console.error('Error updating token:', updateTokenError);
      return new Response(JSON.stringify({ error: 'Failed to verify phone number' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Extract phone number (remove +1 country code since we always assume US/Canada)
    let phone_number = phone;
    if (phone.startsWith('+1')) {
      phone_number = phone.slice(2).replace(/\D/g, ''); // Remove +1 and any non-digits
    } else {
      phone_number = phone.replace(/\D/g, ''); // Remove all non-digits
    }

    // Update user profile to mark phone as verified and store the phone number
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ 
        phone_verified: true,
        phone_number: phone_number
      })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return new Response(JSON.stringify({ error: 'Failed to update profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ message: 'Phone number verified successfully' }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error('Error in verify-phone function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
