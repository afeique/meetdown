
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phone } = await req.json()
    
    console.log('Received phone verification request for:', phone)
    
    if (!phone) {
      throw new Error('Phone number is required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseClient.auth.getUser(token)

    if (!user) {
      throw new Error('User not authenticated')
    }

    console.log('User authenticated:', user.id)

    // Extract phone digits (remove +1 if present)
    let phoneDigits = phone;
    if (phone.startsWith('+1')) {
      phoneDigits = phone.slice(2).replace(/\D/g, '');
    } else {
      phoneDigits = phone.replace(/\D/g, '');
    }

    console.log('Phone digits for storage:', phoneDigits)
    console.log('Full phone for SMS:', phone)

    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    console.log('Generated verification code:', verificationCode)

    // Delete any existing verification tokens for this user and phone
    const { error: deleteError } = await supabaseClient
      .from('phone_verification_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('phone', phoneDigits)

    if (deleteError) {
      console.error('Error deleting old tokens:', deleteError)
    }

    // Store verification token with digits-only phone
    const { error: tokenError } = await supabaseClient
      .from('phone_verification_tokens')
      .insert({
        user_id: user.id,
        phone: phoneDigits,
        token: verificationCode,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
      })

    if (tokenError) {
      console.error('Error storing token:', tokenError)
      throw tokenError
    }

    console.log('Verification token stored successfully')

    // Send SMS using Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error('Missing Twilio credentials')
      throw new Error('Twilio credentials not configured')
    }

    console.log('Sending SMS via Twilio to:', phone)
    console.log('From number:', twilioPhoneNumber)

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: phone, // Send to the original formatted phone number
          Body: `Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
        }),
      }
    )

    const twilioResponseText = await twilioResponse.text()
    console.log('Twilio response status:', twilioResponse.status)
    console.log('Twilio response body:', twilioResponseText)

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioResponseText)
      throw new Error(`Failed to send SMS: ${twilioResponseText}`)
    }

    console.log('SMS sent successfully')

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send-phone-verification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
