
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import UserProfileHeader from '@/components/UserProfileHeader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MapPin, User, LogOut, ChevronDown } from 'lucide-react';

interface TopBarProps {
  showBackButton?: boolean;
  title?: string;
}

const TopBar = ({ showBackButton = false, title }: TopBarProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out successfully",
        description: "See you soon!",
      });
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
              >
                ← Back
              </button>
            )}
            <img 
              src="/logo.png" 
              alt="meetdown" 
              className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            />
            {title && (
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <UserProfileHeader />
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <DropdownMenuItem 
                  onClick={() => navigate('/my-events')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="h-4 w-4" />
                  My Events
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
