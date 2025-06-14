
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPhoneForDisplay, extractDigitsOnly } from '@/utils/phoneUtils';
import { usePhoneVerification } from './phone-verification/usePhoneVerification';
import PhoneInputStep from './phone-verification/PhoneInputStep';
import VerificationCodeStep from './phone-verification/VerificationCodeStep';

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
  // Parse initial phone (remove +1 if present since we assume it)
  const parseInitialPhone = (phone: string) => {
    if (!phone) return '';
    const digitsOnly = phone.startsWith('+1') ? phone.slice(2) : phone;
    return formatPhoneForDisplay(digitsOnly);
  };

  const [phoneNumber, setPhoneNumber] = useState(parseInitialPhone(initialPhone));
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');

  const { 
    loading, 
    resendCooldown, 
    sendCode, 
    resendCode, 
    verifyCode, 
    getFullPhoneNumber 
  } = usePhoneVerification();

  const handleSendCode = async () => {
    const success = await sendCode(phoneNumber);
    if (success) {
      setStep('verify');
    }
  };

  const handleResendCode = async () => {
    await resendCode(phoneNumber);
  };

  const handleVerifyCode = async () => {
    const success = await verifyCode(phoneNumber, verificationCode);
    if (success) {
      onSuccess();
      onClose();
      setStep('phone');
      setVerificationCode('');
    }
  };

  const handleClose = () => {
    onClose();
    setStep('phone');
    setVerificationCode('');
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
            <PhoneInputStep
              phoneNumber={phoneNumber}
              onPhoneNumberChange={setPhoneNumber}
              onSendCode={handleSendCode}
              loading={loading}
            />
          ) : (
            <VerificationCodeStep
              verificationCode={verificationCode}
              onVerificationCodeChange={setVerificationCode}
              formattedPhoneNumber={getFullPhoneNumber(phoneNumber)}
              onResendCode={handleResendCode}
              onVerifyCode={handleVerifyCode}
              onBack={() => setStep('phone')}
              loading={loading}
              resendCooldown={resendCooldown}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhoneVerificationModal;
