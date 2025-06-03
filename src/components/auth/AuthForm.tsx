
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import NameFields from './NameFields';

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

  const isEmail = (input: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
  };

  const isPhone = (input: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = input.replace(/\D/g, '');
    // Check if it's a valid phone number (10-15 digits, optionally starting with +)
    return /^(\+?1?)?[0-9]{10,14}$/.test(digitsOnly) && digitsOnly.length >= 10;
  };

  const getInputType = (): 'email' | 'phone' | 'unknown' => {
    if (!emailOrPhone.trim()) return 'unknown';
    if (isEmail(emailOrPhone)) return 'email';
    if (isPhone(emailOrPhone)) return 'phone';
    return 'unknown';
  };

  const getRedirectUrl = () => {
    const currentDomain = window.location.origin;
    return currentDomain;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const inputType = getInputType();
    
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
        if (inputType === 'email') {
          const { error } = await supabase.auth.signUp({
            email: emailOrPhone,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
              },
              emailRedirectTo: getRedirectUrl(),
            },
          });

          if (error) throw error;

          toast({
            title: "Account created successfully!",
            description: "Please check your email to verify your account before signing in.",
            duration: 7000,
          });
        } else {
          const { error } = await supabase.auth.signUp({
            phone: emailOrPhone,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
              },
            },
          });

          if (error) throw error;

          toast({
            title: "Account created successfully!",
            description: "You can now sign in with your phone number.",
            duration: 5000,
          });
        }
      } else {
        if (inputType === 'email') {
          const { error } = await supabase.auth.signInWithPassword({
            email: emailOrPhone,
            password,
          });

          if (error) throw error;
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            phone: emailOrPhone,
            password,
          });

          if (error) throw error;
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });

        onSuccess?.();
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputType = getInputType();
  const placeholderText = inputType === 'unknown' ? 'Enter email or phone number' : 
                         inputType === 'email' ? 'john.doe@example.com' : 
                         '+1 (555) 123-4567';

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

          <div className="space-y-2">
            <Label htmlFor="emailOrPhone" className="text-sm font-medium text-gray-700">
              Email or Phone Number
            </Label>
            <Input
              id="emailOrPhone"
              type="text"
              placeholder={placeholderText}
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
            {emailOrPhone && inputType !== 'unknown' && (
              <p className="text-xs text-gray-500 mt-1">
                Detected: {inputType === 'email' ? 'Email address' : 'Phone number'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

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
