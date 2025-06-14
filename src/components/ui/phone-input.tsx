
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PhoneInputProps {
  phoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const PhoneInput = ({
  phoneNumber,
  onPhoneNumberChange,
  label = "Phone Number",
  required = false,
  disabled = false,
  placeholder = "(555) 555-5555"
}: PhoneInputProps) => {
  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Get only digits from the input
    let value = e.target.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    // Format the phone number as user types
    let formattedValue = '';
    if (value.length >= 6) {
      formattedValue = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
    } else if (value.length >= 3) {
      formattedValue = `(${value.slice(0, 3)}) ${value.slice(3)}`;
    } else if (value.length > 0) {
      formattedValue = `(${value}`;
      if (value.length === 3) {
        formattedValue = `(${value}) `;
      }
    }
    
    onPhoneNumberChange(formattedValue);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace, delete, tab, escape, enter, and arrow keys
    if ([8, 9, 27, 13, 37, 38, 39, 40, 46].includes(e.keyCode)) {
      return;
    }
    
    // Allow only digits, parentheses, spaces, and dashes
    const char = String.fromCharCode(e.keyCode);
    if (!/[\d\(\)\s\-]/.test(char)) {
      e.preventDefault();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
        <span className="text-xs text-gray-500 ml-1">(US/Canada +1)</span>
      </Label>
      <Input
        id="phone"
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handlePhoneNumberChange}
        onKeyDown={handleKeyPress}
        disabled={disabled}
        className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
        maxLength={14} // (555) 555-5555 = 14 characters
      />
    </div>
  );
};

export default PhoneInput;
