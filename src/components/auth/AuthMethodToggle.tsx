
import { Mail, Phone } from 'lucide-react';

interface AuthMethodToggleProps {
  authMethod: 'email' | 'phone';
  setAuthMethod: (method: 'email' | 'phone') => void;
}

const AuthMethodToggle: React.FC<AuthMethodToggleProps> = ({ authMethod, setAuthMethod }) => {
  return (
    <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={() => setAuthMethod('email')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
          authMethod === 'email'
            ? 'bg-white text-blue-600 shadow-sm font-medium'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <Mail className="w-4 h-4" />
        Email
      </button>
      <button
        type="button"
        onClick={() => setAuthMethod('phone')}
        className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
          authMethod === 'phone'
            ? 'bg-white text-blue-600 shadow-sm font-medium'
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <Phone className="w-4 h-4" />
        Phone
      </button>
    </div>
  );
};

export default AuthMethodToggle;
