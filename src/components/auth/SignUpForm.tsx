
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCustomEmailVerification } from '@/hooks/useCustomEmailVerification';
import { signUpUser, getAuthErrorMessage } from '@/services/authService';
import { validateSignUpForm } from './AuthFormValidation';
import NameFields from './NameFields';
import ContactFields from './ContactFields';
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';

interface SignUpFormProps {
  onSuccess?: () => void;
  onToggleMode: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onToggleMode }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [ageVerified, setAgeVerified] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { sendVerificationEmail } = useCustomEmailVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validation = validateSignUpForm(email, password, dateOfBirth, ageVerified);
    if (!validation.isValid) {
      toast({
        title: validation.error!.title,
        description: validation.error!.description,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await signUpUser({
        emailOrPhone: email,
        password,
        firstName,
        lastName,
        inputType: 'email',
        dateOfBirth: dateOfBirth?.toISOString().split('T')[0],
        zipCode,
        address: address || undefined,
        email: email,
        phone: phone || undefined,
      });

      console.log('Signup successful, sending custom verification email');
      await sendVerificationEmail(email, firstName);
      
      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account before signing in. We've sent you a beautifully designed verification email.",
        duration: 10000,
      });
    } catch (error: any) {
      console.error('Authentication error:', error);
      
      const errorMessage = getAuthErrorMessage(error);
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <NameFields 
        firstName={firstName}
        lastName={lastName}
        setFirstName={setFirstName}
        setLastName={setLastName}
      />

      <ContactFields
        email={email}
        phone={phone}
        setEmail={setEmail}
        setPhone={setPhone}
        password={password}
        setPassword={setPassword}
      />

      <PersonalInfoFields
        dateOfBirth={dateOfBirth}
        setDateOfBirth={setDateOfBirth}
        ageVerified={ageVerified}
        setAgeVerified={setAgeVerified}
      />

      <AddressFields
        zipCode={zipCode}
        address={address}
        setZipCode={setZipCode}
        setAddress={setAddress}
      />

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        {loading ? 'Loading...' : 'Create Account'}
      </Button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already have an account?{" "}
          <button 
            type="button"
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
