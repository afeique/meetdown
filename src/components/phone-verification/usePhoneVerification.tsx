
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
      
      const { data, error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone: fullPhone },
      });

      if (error) throw error;

      startResendCooldown();
      toast({
        title: "Verification code sent!",
        description: `We've sent a verification code to ${fullPhone} via SMS`,
      });
      return true;
    } catch (error: any) {
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
      
      const { error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone: fullPhone },
      });

      if (error) throw error;

      startResendCooldown();
      toast({
        title: "Code resent!",
        description: `A new verification code has been sent to ${fullPhone}`,
      });
      return true;
    } catch (error: any) {
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
      
      const { error } = await supabase.functions.invoke('verify-phone', {
        body: { 
          phone: fullPhone,
          token: verificationCode 
        },
      });

      if (error) throw error;

      toast({
        title: "Phone verified!",
        description: "Your phone number has been successfully verified.",
      });
      
      return true;
    } catch (error: any) {
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
