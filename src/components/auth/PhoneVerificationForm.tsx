
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { formatPhoneNumber } from '@/utils/phoneUtils';
import { Phone, ArrowLeft } from 'lucide-react';

interface PhoneVerificationFormProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

const PhoneVerificationForm: React.FC<PhoneVerificationFormProps> = ({
  onBack,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const formatPhoneForSubmission = (phoneInput: string) => {
    // Remove all non-digit characters
    const cleaned = phoneInput.replace(/[^\d]/g, '');
    
    // Always assume US (+1) country code
    return formatPhoneNumber(cleaned);
  };

  const handleSendCode = async () => {
    if (!user || !phone.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneForSubmission(phone);
      
      const { error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone: formattedPhone },
      });

      if (error) throw error;

      setStep('verify');
      startResendCooldown();
      toast({
        title: "Verification code sent!",
        description: `We've sent a verification code to ${formattedPhone} via SMS`,
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
      const formattedPhone = formatPhoneForSubmission(phone);
      
      const { error } = await supabase.functions.invoke('send-phone-verification', {
        body: { phone: formattedPhone },
      });

      if (error) throw error;

      startResendCooldown();
      toast({
        title: "Code resent!",
        description: `A new verification code has been sent to ${formattedPhone}`,
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
      const formattedPhone = formatPhoneForSubmission(phone);
      
      const { error } = await supabase.functions.invoke('verify-phone', {
        body: { 
          phone: formattedPhone,
          token: verificationCode 
        },
      });

      if (error) throw error;

      toast({
        title: "Phone verified!",
        description: "Your phone number has been successfully verified.",
      });
      
      onSuccess?.();
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

  return (
    <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
      <CardHeader className="text-center space-y-2 pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center justify-center gap-2">
          <Phone className="h-6 w-6" />
          {step === 'phone' ? 'Verify Phone Number' : 'Enter Verification Code'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={handleSendCode}
                disabled={loading || !phone.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
              
              {onBack && (
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="w-full flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="text-center">
                <Label className="text-sm text-gray-600">
                  Enter the 6-digit code sent to {formatPhoneForSubmission(phone)}
                </Label>
              </div>
              
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
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneVerificationForm;
