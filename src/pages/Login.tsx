
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import EmailVerificationScreen from '@/components/auth/EmailVerificationScreen';
import MeetdownTagline from '@/components/MeetdownTagline';
import Footer from '@/components/Footer';

const Login = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Redirect if already logged in and email is verified
  useEffect(() => {
    if (user && userProfile?.email_verified) {
      navigate('/', { replace: true });
    }
  }, [user, userProfile, navigate]);

  // Show email verification notice if user is logged in but email not verified
  if (user && userProfile && !userProfile.email_verified && user.email) {
    return <EmailVerificationScreen user={user} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <img 
              src="/logo.png" 
              alt="meetdown" 
              className="w-128 h-128 mx-auto mb-2"
            />
            <MeetdownTagline />
          </div>

          {/* Authentication Form */}
          <AuthForm onSuccess={() => navigate('/', { replace: true })} />

          {/* Bottom Text */}
          {/* Obsoleted by Footer
          <div className="text-center mt-6">
            <p className="text-xs text-gray-500">
              By signing up or signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
        */}
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
