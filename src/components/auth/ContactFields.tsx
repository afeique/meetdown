
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone } from 'lucide-react';

interface ContactFieldsProps {
  email: string;
  phone: string;
  setEmail: (value: string) => void;
  setPhone: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isSignIn?: boolean;
}

const ContactFields: React.FC<ContactFieldsProps> = ({
  email,
  phone,
  setEmail,
  setPhone,
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

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number <span className="text-gray-400">(optional)</span>
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      )}

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

export default ContactFields;
