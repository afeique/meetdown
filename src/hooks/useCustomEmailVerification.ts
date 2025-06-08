
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCustomEmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendVerificationEmail = async (email: string, firstName?: string) => {
    setLoading(true);
    try {
      console.log('Sending custom verification email to:', email);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      
      // Generate a verification token
      const token = crypto.randomUUID();
      const redirectUrl = window.location.origin;
      
      // Call our custom edge function
      const { data, error } = await supabase.functions.invoke('send-verification-email', {
        body: {
          email,
          token,
          redirectUrl,
          firstName,
          userId: user.id,
        },
      });

      if (error) {
        console.error('Error calling send-verification-email function:', error);
        throw error;
      }

      console.log('Custom verification email sent successfully:', data);
      
      toast({
        title: "Verification email sent!",
        description: `Please check your email (${email}) for the verification link. Don't forget to check your spam folder.`,
        duration: 8000,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error in sendVerificationEmail:', error);
      
      let errorMessage = "Failed to send verification email. Please try again.";
      
      if (error.message?.includes('rate limit')) {
        errorMessage = "You've requested too many verification emails. Please wait a few minutes before trying again.";
      }
      
      toast({
        title: "Error sending verification email",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailToken = async (token: string) => {
    setLoading(true);
    try {
      console.log('Verifying email token:', token);
      
      const { data, error } = await supabase.functions.invoke('verify-email-token', {
        body: { token },
      });

      if (error) {
        console.error('Error verifying email token:', error);
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Verification failed');
      }

      console.log('Email verification successful:', data);
      
      toast({
        title: "Email verified successfully!",
        description: "Your email has been verified. You can now access all features.",
        duration: 5000,
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error in verifyEmailToken:', error);
      
      let errorMessage = "Failed to verify email. The link may be invalid or expired.";
      
      if (error.message?.includes('expired')) {
        errorMessage = "The verification link has expired. Please request a new one.";
      } else if (error.message?.includes('Invalid')) {
        errorMessage = "The verification link is invalid. Please request a new one.";
      }
      
      toast({
        title: "Email verification failed",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    sendVerificationEmail,
    verifyEmailToken,
    loading,
  };
};
