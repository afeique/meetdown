
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NameFieldsProps {
  firstName: string;
  lastName: string;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
}

const NameFields: React.FC<NameFieldsProps> = ({ 
  firstName, 
  lastName, 
  setFirstName, 
  setLastName 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
          First Name
        </Label>
        <Input
          id="firstName"
          type="text"
          placeholder="John"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
          Last Name
        </Label>
        <Input
          id="lastName"
          type="text"
          placeholder="Doe"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>
    </div>
  );
};

export default NameFields;
