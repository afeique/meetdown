
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

interface VerificationCodeStepProps {
  verificationCode: string;
  onVerificationCodeChange: (value: string) => void;
  formattedPhoneNumber: string;
  onResendCode: () => void;
  onVerifyCode: () => void;
  onBack: () => void;
  loading: boolean;
  resendCooldown: number;
}

const VerificationCodeStep = ({
  verificationCode,
  onVerificationCodeChange,
  formattedPhoneNumber,
  onResendCode,
  onVerifyCode,
  onBack,
  loading,
  resendCooldown
}: VerificationCodeStepProps) => {
  return (
    <>
      <div className="space-y-2">
        <Label>Enter the 6-digit code sent to {formattedPhoneNumber}</Label>
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={verificationCode}
            onChange={onVerificationCodeChange}
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
          onClick={onResendCode}
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
          onClick={onBack}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={onVerifyCode}
          disabled={loading || verificationCode.length !== 6}
          className="flex-1"
        >
          {loading ? 'Verifying...' : 'Verify'}
        </Button>
      </div>
    </>
  );
};

export default VerificationCodeStep;
