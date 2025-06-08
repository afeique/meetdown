
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyTokenRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { token }: VerifyTokenRequest = await req.json();

    console.log('Verifying email token:', token);

    // Find the verification token in the database
    const { data: tokenData, error: tokenError } = await supabase
      .from('email_verification_tokens')
      .select('user_id, email, created_at')
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token not found or error:', tokenError);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired token" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if token is expired (24 hours)
    const tokenAge = Date.now() - new Date(tokenData.created_at).getTime();
    const tokenExpired = tokenAge > 24 * 60 * 60 * 1000; // 24 hours

    if (tokenExpired) {
      console.log('Token expired');
      // Clean up expired token
      await supabase
        .from('email_verification_tokens')
        .delete()
        .eq('token', token);

      return new Response(
        JSON.stringify({ success: false, error: "Token has expired" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update the user's email_verified status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ email_verified: true })
      .eq('id', tokenData.user_id);

    if (updateError) {
      console.error('Error updating email_verified status:', updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify email" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Clean up the used token
    await supabase
      .from('email_verification_tokens')
      .delete()
      .eq('token', token);

    console.log('Email verification successful for user:', tokenData.user_id);

    return new Response(
      JSON.stringify({ success: true, message: "Email verified successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-email-token function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
