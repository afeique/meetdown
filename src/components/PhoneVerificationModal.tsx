
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import PhoneInput from '@/components/ui/phone-input';
import { formatPhoneNumber } from '@/utils/phoneUtils';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialPhone?: string;
}

const PhoneVerificationModal: React.FC<PhoneVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialPhone = '',
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Parse initial phone (remove +1 if present since we assume it)
  const parseInitialPhone = (phone: string) => {
    if (!phone) return '';
    return phone.startsWith('+1') ? phone.slice(2) : phone;
  };

  const [phoneNumber, setPhoneNumber] = useState(parseInitialPhone(initialPhone));
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const getFullPhoneNumber = () => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    return '+1' + cleanNumber;
  };

  const getFormattedPhoneNumber = () => {
    return formatPhoneNumber(phoneNumber);
  };

  const handleSendCode = async () => {
    if (!user || !phoneNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fullPhone = getFullPhoneNumber();
      
      const { data, error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone: fullPhone },
      });

      if (error) throw error;

      setStep('verify');
      startResendCooldown();
      toast({
        title: "Verification code sent!",
        description: `We've sent a verification code to ${getFormattedPhoneNumber()} via SMS`,
      });
    } catch (error: any) {
      toast({
        title: "Error sending verification code",
        description: error.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const fullPhone = getFullPhoneNumber();
      
      const { error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone: fullPhone },
      });

      if (error) throw error;

      startResendCooldown();
      toast({
        title: "Code resent!",
        description: `A new verification code has been sent to ${getFormattedPhoneNumber()}`,
      });
    } catch (error: any) {
      toast({
        title: "Error resending code",
        description: error.message || "Failed to resend verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleVerifyCode = async () => {
    if (!user || !verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a valid 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fullPhone = getFullPhoneNumber();
      
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
      
      onSuccess();
      onClose();
      setStep('phone');
      setVerificationCode('');
      setResendCooldown(0);
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep('phone');
    setVerificationCode('');
    setResendCooldown(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'phone' ? 'Verify Phone Number' : 'Enter Verification Code'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'phone' ? (
            <>
              <PhoneInput
                phoneNumber={phoneNumber}
                onPhoneNumberChange={setPhoneNumber}
                label="Phone Number"
                placeholder="(555) 123-4567"
              />
              <Button
                onClick={handleSendCode}
                disabled={loading || !phoneNumber.trim()}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Enter the 6-digit code sent to {getFormattedPhoneNumber()}</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={verificationCode}
                    onChange={setVerificationCode}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={handleResendCode}
                  disabled={resendCooldown > 0 || loading}
                  className="text-sm"
                >
                  {resendCooldown > 0 
                    ? `Resend code in ${resendCooldown}s` 
                    : 'Resend code'
                  }
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('phone')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleVerifyCode}
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerificationModal;
