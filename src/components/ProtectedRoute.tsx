
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
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

  return <>{children}</>;
};

export default ProtectedRoute;
