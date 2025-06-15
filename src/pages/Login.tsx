
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import EmailVerificationScreen from '@/components/auth/EmailVerificationScreen';
import MeetdownTagline from '@/components/MeetdownTagline';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

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
  if (user && userProfile && !userProfile.email_verified) {
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

          {/* Email Verification Help */}
          {user && userProfile && !userProfile.email_verified && (
            <div className="mt-6 text-center">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  Having trouble with email verification?
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Try Email Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Login;
