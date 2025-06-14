
import { Button } from '@/components/ui/button';
import PhoneInput from '@/components/ui/phone-input';

interface PhoneInputStepProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onSendCode: () => void;
  loading: boolean;
}

const PhoneInputStep = ({ 
  phoneNumber, 
  onPhoneNumberChange, 
  onSendCode, 
  loading 
}: PhoneInputStepProps) => {
  return (
    <>
      <PhoneInput
        phoneNumber={phoneNumber}
        onPhoneNumberChange={onPhoneNumberChange}
        label="Phone Number"
        placeholder="(555) 123-4567"
      />
      <Button
        onClick={onSendCode}
        disabled={loading || !phoneNumber.trim()}
        className="w-full"
      >
        {loading ? 'Sending...' : 'Send Verification Code'}
      </Button>
    </>
  );
};

export default PhoneInputStep;
