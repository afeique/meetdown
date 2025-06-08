
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getInputType, getPlaceholderText } from '@/utils/inputValidation';
import { formatPhoneNumber } from '@/utils/phoneUtils';

interface AuthFormFieldProps {
  emailOrPhone: string;
  setEmailOrPhone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
}

const AuthFormField: React.FC<AuthFormFieldProps> = ({
  emailOrPhone,
  setEmailOrPhone,
  password,
  setPassword,
}) => {
  const inputType = getInputType(emailOrPhone);
  const placeholderText = getPlaceholderText(inputType);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="emailOrPhone" className="text-sm font-medium text-gray-700">
          Email or Phone Number
        </Label>
        <Input
          id="emailOrPhone"
          type="text"
          placeholder={placeholderText}
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
        {emailOrPhone && inputType !== 'unknown' && (
          <p className="text-xs text-gray-500 mt-1">
            Detected: {inputType === 'email' ? 'Email address' : 'Phone number'}
            {inputType === 'phone' && ` (will be formatted as: ${formatPhoneNumber(emailOrPhone)})`}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
    </>
  );
};

export default AuthFormField;
