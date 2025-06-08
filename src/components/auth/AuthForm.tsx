
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCustomEmailVerification } from '@/hooks/useCustomEmailVerification';
import { signUpUser, signInUser, getAuthErrorMessage } from '@/services/authService';
import NameFields from './NameFields';
import ContactFields from './ContactFields';
import PersonalInfoFields from './PersonalInfoFields';
import AddressFields from './AddressFields';
import AuthFormField from './AuthFormField';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [ageVerified, setAgeVerified] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [address, setAddress] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { sendVerificationEmail } = useCustomEmailVerification();

  const validateAge = (birthDate: Date): boolean => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 13;
    }
    return age >= 13;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation for sign up
    if (isSignUp) {
      if (!email) {
        toast({
          title: "Email Required",
          description: "Please provide an email address.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!dateOfBirth) {
        toast({
          title: "Date of Birth Required",
          description: "Please select your date of birth.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (dateOfBirth >= new Date()) {
        toast({
          title: "Invalid Date of Birth",
          description: "Date of birth must be before today.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!validateAge(dateOfBirth)) {
        toast({
          title: "Age Requirement",
          description: "You must be at least 13 years old to register.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!ageVerified) {
        toast({
          title: "Age Verification Required",
          description: "Please confirm that you are at least 13 years of age.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        // For signup, email is always required, phone is optional
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
      } else {
        // For sign in, use emailOrPhone from the single field
        const { getInputType } = await import('@/utils/inputValidation');
        const inputType = getInputType(emailOrPhone);

        if (!emailOrPhone) {
          toast({
            title: "Contact Information Required",
            description: "Please provide either an email address or phone number.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        if (inputType === 'unknown') {
          toast({
            title: "Invalid Contact Information",
            description: "Please enter a valid email address or phone number.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        await signInUser({
          emailOrPhone,
          password,
          inputType: inputType as 'email' | 'phone',
        });

        console.log('Signin successful');
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });

        onSuccess?.();
      }
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
    <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
      <CardHeader className="text-center space-y-2 pb-6">
        <CardTitle className="text-2xl font-semibold text-gray-800">
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {isSignUp 
            ? 'Sign up to start connecting with others' 
            : 'Sign in to your account'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <>
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
            </>
          )}

          {!isSignUp && (
            <AuthFormField
              emailOrPhone={emailOrPhone}
              setEmailOrPhone={setEmailOrPhone}
              password={password}
              setPassword={setPassword}
            />
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{" "}
            <button 
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
