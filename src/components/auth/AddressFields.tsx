
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Home } from 'lucide-react';

interface AddressFieldsProps {
  zipCode: string;
  address: string;
  setZipCode: (value: string) => void;
  setAddress: (value: string) => void;
}

const AddressFields: React.FC<AddressFieldsProps> = ({
  zipCode,
  address,
  setZipCode,
  setAddress,
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
          Zip or Postal Code <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="zipCode"
            type="text"
            placeholder="12345 or A1B 2C3"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="text-sm font-medium text-gray-700">
          Address <span className="text-gray-400">(optional)</span>
        </Label>
        <div className="relative">
          <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="address"
            type="text"
            placeholder="123 Main Street, City, State"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default AddressFields;
