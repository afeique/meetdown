
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, userProfile, loading } = useAuth();

  // Show loading only briefly while auth is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If no user, redirect to login page
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
