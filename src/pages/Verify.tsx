
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomEmailVerification } from '@/hooks/useCustomEmailVerification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Footer from '@/components/Footer';

const Verify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, refreshProfile } = useAuth();
  const { verifyEmailToken } = useCustomEmailVerification();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (type !== 'email' || !token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      console.log('Processing email verification with token:', token);
      
      try {
        const result = await verifyEmailToken(token);
        
        if (result.success) {
          // Refresh the user profile to get updated email_verified status
          if (user) {
            await refreshProfile();
          }
          
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          
          toast({
            title: "Email verified successfully!",
            description: "Redirecting to home page...",
            duration: 3000,
          });
          
          // Navigate to home page after a short delay
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Verification failed');
        }
      } catch (error) {
        console.error('Error during email verification:', error);
        setStatus('error');
        setMessage('An error occurred during verification');
      }
    };

    verifyEmail();
  }, [searchParams, verifyEmailToken, user, refreshProfile, navigate, toast]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex-1 flex items-center justify-center p-4">
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
                {status === 'verifying' && <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />}
                {status === 'success' && <CheckCircle className="w-8 h-8 text-green-600" />}
                {status === 'error' && <XCircle className="w-8 h-8 text-red-600" />}
              </div>
              <CardTitle className="text-2xl font-semibold text-gray-800">
                {status === 'verifying' && 'Verifying Email'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {status === 'verifying' && 'Please wait while we verify your email address...'}
                {status === 'success' && message}
                {status === 'error' && message}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {status === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 text-center">
                    Redirecting you to the home page...
                  </p>
                </div>
              )}
              
              {status === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 text-center">
                    Please try requesting a new verification email or contact support if the problem persists.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Verify;
