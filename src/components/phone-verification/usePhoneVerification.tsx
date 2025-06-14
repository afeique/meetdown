
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { extractDigitsOnly } from '@/utils/phoneUtils';

export const usePhoneVerification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const startResendCooldown = () => {
    setResendCooldown(60);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getFullPhoneNumber = (phoneNumber: string) => {
    const cleanNumber = extractDigitsOnly(phoneNumber);
    console.log('Formatted phone number for verification:', '+1' + cleanNumber);
    return '+1' + cleanNumber;
  };

  const sendCode = async (phoneNumber: string) => {
    if (!user || !phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const fullPhone = getFullPhoneNumber(phoneNumber);
      console.log('Sending verification code to:', fullPhone);
      
      const { data, error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone: fullPhone },
      });

      console.log('Send verification response:', { data, error });

      if (error) {
        console.error('Error sending verification:', error);
        throw error;
      }

      startResendCooldown();
      toast({
        title: "Verification code sent!",
        description: `We've sent a verification code to ${fullPhone} via SMS`,
      });
      return true;
    } catch (error: any) {
      console.error('Send code error:', error);
      toast({
        title: "Error sending verification code",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async (phoneNumber: string) => {
    if (resendCooldown > 0) return false;
    
    setLoading(true);
    try {
      const fullPhone = getFullPhoneNumber(phoneNumber);
      console.log('Resending verification code to:', fullPhone);
      
      const { error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone: fullPhone },
      });

      console.log('Resend verification response error:', error);

      if (error) {
        console.error('Error resending verification:', error);
        throw error;
      }

      startResendCooldown();
      toast({
        title: "Code resent!",
        description: `A new verification code has been sent to ${fullPhone}`,
      });
      return true;
    } catch (error: any) {
      console.error('Resend code error:', error);
      toast({
        title: "Error resending code",
        description: error.message || "Failed to resend verification code",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (phoneNumber: string, verificationCode: string) => {
    if (!user || !verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);
    try {
      const fullPhone = getFullPhoneNumber(phoneNumber);
      console.log('Verifying code for phone:', fullPhone, 'with code:', verificationCode);
      
      const { error } = await supabase.functions.invoke('verify-phone', {
        body: { 
          phone: fullPhone,
          token: verificationCode 
        },
      });

      console.log('Verify code response error:', error);

      if (error) {
        console.error('Error verifying code:', error);
        throw error;
      }

      toast({
        title: "Phone verified!",
        description: "Your phone number has been successfully verified.",
      });
      
      return true;
    } catch (error: any) {
      console.error('Verify code error:', error);
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    resendCooldown,
    sendCode,
    resendCode,
    verifyCode,
    getFullPhoneNumber
  };
};
