
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useCustomEmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendVerificationEmail = async (email: string, firstName?: string) => {
    setLoading(true);
    try {
      console.log('Sending custom verification email to:', email);
      
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

  return {
    sendVerificationEmail,
    loading,
  };
};
