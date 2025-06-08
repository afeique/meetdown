
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCustomEmailVerification } from '@/hooks/useCustomEmailVerification';
import { AlertCircle, Mail } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface EmailVerificationScreenProps {
  user: User;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { sendVerificationEmail, loading: customEmailLoading } = useCustomEmailVerification();

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      // Get user's first name from user metadata
      const firstName = user.user_metadata?.first_name;
      
      // Use our custom email verification system
      const result = await sendVerificationEmail(user.email, firstName);
      
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Error in handleResendVerification:', error);
      
      // The error handling is done in the custom hook
      // This is just for any unexpected errors
      if (!error.message?.includes('rate limit')) {
        toast({
          title: "Error sending verification email",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
          duration: 8000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const isLoading = loading || customEmailLoading;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
            meetdown
          </h1>
          <p className="text-gray-600 text-lg">Are you down to meet?</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a verification link to <strong>{user.email}</strong>. 
              Please click the link in your email to verify your account.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Email verification required</p>
                <p>You need to verify your email before you can access the app. Check your spam folder if you don't see the email.</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Troubleshooting tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Check your spam/junk folder</li>
                <li>• Make sure {user.email} is correct</li>
                <li>• Wait a few minutes for the email to arrive</li>
                <li>• Try resending the verification email</li>
              </ul>
            </div>

            <Button
              onClick={handleResendVerification}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
            >
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>

            <div className="text-center">
              <button 
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Sign out and use a different account
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerificationScreen;
