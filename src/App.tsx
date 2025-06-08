
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Followers from "./pages/Followers";
import MyEvents from "./pages/MyEvents";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Handle verification on the login page - both direct access and with verification params */}
            <Route path="/feed" element={<Login />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/followers" element={
              <ProtectedRoute>
                <Followers />
              </ProtectedRoute>
            } />
            <Route path="/my-events" element={
              <ProtectedRoute>
                <MyEvents />
              </ProtectedRoute>
            } />
            {/* Home route - redirect verification URLs to login */}
            <Route path="/" element={
              <VerificationRedirect>
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              </VerificationRedirect>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

// Component to handle verification redirects
const VerificationRedirect = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');
    const token = urlParams.get('token');
    
    // If this is a verification URL, redirect to login page with the parameters
    if (type === 'email' && token) {
      navigate(`/feed?type=${type}&token=${token}`, { replace: true });
      return;
    }
  }, [navigate]);
  
  return <>{children}</>;
};

// Import useNavigate and useEffect
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default App;
