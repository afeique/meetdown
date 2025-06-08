
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCustomEmailVerification } from '@/hooks/useCustomEmailVerification';
import { getInputType } from '@/utils/inputValidation';
import { signUpUser, signInUser, getAuthErrorMessage } from '@/services/authService';
import NameFields from './NameFields';
import AuthFormField from './AuthFormField';

interface AuthFormProps {
  onSuccess?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { sendVerificationEmail } = useCustomEmailVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const inputType = getInputType(emailOrPhone);
    
    if (inputType === 'unknown') {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid email address or phone number.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const result = await signUpUser({
          emailOrPhone,
          password,
          firstName,
          lastName,
          inputType,
        });

        if (result.isEmail) {
          console.log('Signup successful, sending custom verification email');
          await sendVerificationEmail(emailOrPhone, firstName);
          
          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account before signing in. We've sent you a beautifully designed verification email.",
            duration: 10000,
          });
        } else {
          console.log('Phone signup successful');
          toast({
            title: "Account created successfully!",
            description: "You can now sign in with your phone number.",
            duration: 5000,
          });
        }
      } else {
        await signInUser({
          emailOrPhone,
          password,
          inputType,
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
            <NameFields 
              firstName={firstName}
              lastName={lastName}
              setFirstName={setFirstName}
              setLastName={setLastName}
            />
          )}

          <AuthFormField
            emailOrPhone={emailOrPhone}
            setEmailOrPhone={setEmailOrPhone}
            password={password}
            setPassword={setPassword}
          />

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
