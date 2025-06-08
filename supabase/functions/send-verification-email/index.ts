
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  token: string;
  redirectUrl: string;
  firstName?: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, redirectUrl, firstName, userId }: VerificationEmailRequest = await req.json();

    console.log('Sending verification email to:', email);
    console.log('Original redirect URL:', redirectUrl);

    // Store the verification token in the database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: tokenError } = await supabase
      .from('email_verification_tokens')
      .insert({
        token,
        user_id: userId,
        email,
        created_at: new Date().toISOString()
      });

    if (tokenError) {
      console.error('Error storing verification token:', tokenError);
      return new Response(
        JSON.stringify({ error: "Failed to store verification token" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Use meetdown.org domain instead of the Lovable URL
    const productionUrl = "https://meetdown.org";
    const verificationUrl = `${productionUrl}?token=${token}&type=email`;

    console.log('Using verification URL:', verificationUrl);

    const emailResponse = await resend.emails.send({
      from: "Meetdown <onboarding@resend.dev>",
      to: [email],
      subject: "Verify your email address",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <div style="background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
                    meetdown
                  </h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                    Are you down to meet?
                  </p>
                </div>

                <!-- Content -->
                <div style="padding: 40px 30px;">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <div style="display: inline-block; width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                      <span style="color: white; font-size: 32px;">✉️</span>
                    </div>
                    <h2 style="margin: 0 0 12px 0; color: #333; font-size: 24px; font-weight: 600;">
                      Verify Your Email Address
                    </h2>
                    ${firstName ? `<p style="margin: 0 0 20px 0; color: #666; font-size: 16px;">Hi ${firstName}!</p>` : ''}
                    <p style="margin: 0 0 30px 0; color: #666; font-size: 16px; line-height: 1.5;">
                      Welcome to meetdown! Please click the button below to verify your email address and complete your account setup.
                    </p>
                  </div>

                  <!-- Verification Button -->
                  <div style="text-align: center; margin: 40px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                      Verify Email Address
                    </a>
                  </div>

                  <!-- Alternative Link -->
                  <div style="border-top: 1px solid #eee; padding-top: 30px; margin-top: 30px;">
                    <p style="margin: 0 0 12px 0; color: #666; font-size: 14px; text-align: center;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 0; text-align: center;">
                      <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; word-break: break-all;">
                        ${verificationUrl}
                      </a>
                    </p>
                  </div>

                  <!-- Security Notice -->
                  <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin-top: 30px;">
                    <p style="margin: 0; color: #666; font-size: 14px; text-align: center;">
                      🔒 This verification link will expire in 24 hours for security reasons.
                    </p>
                  </div>
                </div>

                <!-- Footer -->
                <div style="background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee;">
                  <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">
                    If you didn't create an account with meetdown, you can safely ignore this email.
                  </p>
                  <p style="margin: 0; color: #999; font-size: 12px;">
                    © ${new Date().getFullYear()} meetdown. All rights reserved.
                  </p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Verification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, messageId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending verification email:", error);
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
