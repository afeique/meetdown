
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { signInUser, getAuthErrorMessage } from '@/services/authService';
import { validateSignInForm } from './AuthFormValidation';
import AuthFormField from './AuthFormField';

interface SignInFormProps {
  onSuccess?: () => void;
  onToggleMode: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, onToggleMode }) => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validation = validateSignInForm(emailOrPhone);
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
      const { getInputType } = await import('@/utils/inputValidation');
      const inputType = getInputType(emailOrPhone);

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
        {loading ? 'Loading...' : 'Sign In'}
      </Button>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Don't have an account?{" "}
          <button 
            type="button"
            onClick={onToggleMode}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </form>
  );
};

export default SignInForm;
