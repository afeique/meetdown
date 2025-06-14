
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';
import PasswordStrengthChecker from './PasswordStrengthChecker';
import PhoneInput from '@/components/ui/phone-input';

interface ContactFieldsProps {
  email: string;
  countryCode: string;
  phoneNumber: string;
  setEmail: (value: string) => void;
  setCountryCode: (value: string) => void;
  setPhoneNumber: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isSignIn?: boolean;
}

const ContactFields: React.FC<ContactFieldsProps> = ({
  email,
  countryCode,
  phoneNumber,
  setEmail,
  setCountryCode,
  setPhoneNumber,
  password,
  setPassword,
  isSignIn = false,
}) => {
  return (
    <>
      {!isSignIn && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <PhoneInput
            countryCode={countryCode}
            phoneNumber={phoneNumber}
            onCountryCodeChange={setCountryCode}
            onPhoneNumberChange={setPhoneNumber}
            label="Phone Number"
            placeholder="(555) 123-4567"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-700">
          Password {!isSignIn && <span className="text-red-500">*</span>}
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
        {!isSignIn && <PasswordStrengthChecker password={password} />}
      </div>
    </>
  );
};

export default ContactFields;
