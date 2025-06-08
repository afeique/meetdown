
import { Check, X } from 'lucide-react';

interface PasswordStrengthCheckerProps {
  password: string;
}

const PasswordStrengthChecker: React.FC<PasswordStrengthCheckerProps> = ({ password }) => {
  const checks = [
    {
      label: 'At least 8 characters',
      isValid: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter',
      isValid: /[A-Z]/.test(password),
    },
    {
      label: 'Contains lowercase letter',
      isValid: /[a-z]/.test(password),
    },
    {
      label: 'Contains number',
      isValid: /\d/.test(password),
    },
    {
      label: 'Contains symbol (!@#$%^&*)',
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    },
  ];

  const validChecks = checks.filter(check => check.isValid).length;
  const strengthLevel = validChecks === 0 ? 'weak' : validChecks <= 2 ? 'weak' : validChecks <= 3 ? 'medium' : validChecks <= 4 ? 'good' : 'strong';
  
  const strengthColors = {
    weak: 'text-red-500',
    medium: 'text-yellow-500',
    good: 'text-blue-500',
    strong: 'text-green-500',
  };

  const strengthBarColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      <div className="space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-600">Password Strength</span>
          <span className={`text-xs font-medium capitalize ${strengthColors[strengthLevel]}`}>
            {strengthLevel}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${strengthBarColors[strengthLevel]}`}
            style={{ width: `${(validChecks / checks.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-1">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center space-x-2">
            {check.isValid ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <X className="h-3 w-3 text-gray-400" />
            )}
            <span className={`text-xs ${check.isValid ? 'text-green-600' : 'text-gray-500'}`}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 p-2 bg-blue-50 rounded-md">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> Use a combination of uppercase letters, lowercase letters, numbers, and symbols for the strongest password.
        </p>
      </div>
    </div>
  );
};

export default PasswordStrengthChecker;
