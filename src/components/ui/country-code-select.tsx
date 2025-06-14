
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CountryCodeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

const CountryCodeSelect = ({ value, onValueChange, disabled }: CountryCodeSelectProps) => {
  const countryCodes = [
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+1', country: 'Canada', flag: '🇨🇦' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
  ];

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Code" />
      </SelectTrigger>
      <SelectContent>
        {countryCodes.map((country, index) => (
          <SelectItem key={`${country.code}-${index}`} value={country.code}>
            <div className="flex items-center gap-2">
              <span>{country.flag}</span>
              <span>{country.code}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountryCodeSelect;
