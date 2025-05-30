
import { useAuth } from "@/contexts/AuthContext";
import LogoutButton from "@/components/LogoutButton";
import LocationBar from "@/components/LocationBar";
import EventsFeed from "@/components/EventsFeed";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with logout button and profile link */}
      <div className="flex justify-between items-center p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
          meetdown
        </h1>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2"
          >
            <User size={16} />
            Profile
          </Button>
          <LogoutButton />
        </div>
      </div>

      {/* Location input bar */}
      <LocationBar />

      {/* Welcome message */}
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h2>
          <p className="text-lg text-gray-600">
            Are you down to meet? Check out these events near you.
          </p>
        </div>
      </div>

      {/* Events feed */}
      <EventsFeed />
    </div>
  );
};

export default Index;
