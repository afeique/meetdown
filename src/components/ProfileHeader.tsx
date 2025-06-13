
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserProfileHeader from '@/components/UserProfileHeader';

interface ProfileHeaderProps {
  isEditing: boolean;
  onToggleEdit: () => void;
}

const ProfileHeader = ({ isEditing, onToggleEdit }: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>
            <img 
              src="/lovable-uploads/7b32dd92-264e-4428-86f2-aba196d3abf8.png" 
              alt="meetdown" 
              className="h-8"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditing ? 'Edit Profile' : 'My Profile'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onToggleEdit}
              className="flex items-center gap-2"
            >
              <Edit size={16} />
              {isEditing ? 'View Profile' : 'Edit Profile'}
            </Button>
            <UserProfileHeader />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
