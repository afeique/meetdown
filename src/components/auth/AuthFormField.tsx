
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getInputType } from '@/utils/inputValidation';

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

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email address"
          value={emailOrPhone}
          onChange={(e) => setEmailOrPhone(e.target.value)}
          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
        {emailOrPhone && inputType === 'email' && (
          <p className="text-xs text-gray-500 mt-1">
            Valid email address
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
