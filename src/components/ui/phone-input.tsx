
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CountryCodeSelect from './country-code-select';

interface PhoneInputProps {
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneInput = ({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  label = "Phone Number",
  required = false,
  disabled = false,
  placeholder = "(555) 123-4567"
}: PhoneInputProps) => {
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format the phone number as user types
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
      value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    onPhoneNumberChange(value);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2">
        <CountryCodeSelect
          value={countryCode}
          onValueChange={onCountryCodeChange}
          disabled={disabled}
        />
        <Input
          id="phone"
          type="tel"
          placeholder={placeholder}
          value={phoneNumber}
          onChange={handlePhoneNumberChange}
          disabled={disabled}
          className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          maxLength={14}
        />
      </div>
    </div>
  );
};

export default PhoneInput;
