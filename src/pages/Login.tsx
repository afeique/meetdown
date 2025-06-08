
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomEmailVerification } from '@/hooks/useCustomEmailVerification';
import AuthForm from '@/components/auth/AuthForm';
import EmailVerificationScreen from '@/components/auth/EmailVerificationScreen';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, userProfile, refreshProfile } = useAuth();
  const { verifyEmailToken } = useCustomEmailVerification();

  // Redirect if already logged in and email is verified
  useEffect(() => {
    if (user && userProfile?.email_verified) {
      navigate('/', { replace: true });
    }
  }, [user, userProfile, navigate]);

  // Check for email verification on component mount
  useEffect(() => {
    const checkEmailVerification = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      const token = urlParams.get('token');
      
      if (type === 'email' && token) {
        console.log('Processing email verification with token:', token);
        
        // Verify the token
        const result = await verifyEmailToken(token);
        
        if (result.success) {
          // Refresh the user profile to get updated email_verified status
          if (user) {
            await refreshProfile();
          }
          
          // Clear the URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Navigate to home page
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 1000);
        }
      }
    };

    checkEmailVerification();
  }, [user, refreshProfile, verifyEmailToken, navigate]);

  // Show email verification notice if user is logged in but email not verified
  if (user && userProfile && !userProfile.email_verified && user.email) {
    return <EmailVerificationScreen user={user} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent mb-2">
            meetdown
          </h1>
          <p className="text-gray-600 text-lg">Are you down to meet?</p>
        </div>

        {/* Authentication Form */}
        <AuthForm onSuccess={() => navigate('/', { replace: true })} />

        {/* Bottom Text */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            By signing up or signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
