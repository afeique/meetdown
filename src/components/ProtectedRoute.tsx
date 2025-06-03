
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log('Auth loading timeout reached');
      setTimeoutReached(true);
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // If still loading and timeout hasn't been reached, show loading
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If timeout reached and still loading, treat as not authenticated
  if (timeoutReached && loading) {
    console.warn('Auth loading timed out, redirecting to login');
    return <Navigate to="/feed" replace />;
  }

  if (!user) {
    return <Navigate to="/feed" replace />;
  }

  // Allow access if user has email and it's verified, OR if user signed up with phone (no email)
  const hasEmailAndVerified = user.email && userProfile?.email_verified;
  const hasPhoneOnly = user.phone && !user.email;
  
  if (hasEmailAndVerified || hasPhoneOnly) {
    return <>{children}</>;
  }

  // If user has email but it's not verified, redirect to login (which will show verification screen)
  if (user.email && !userProfile?.email_verified) {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
