
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ProfilePictureDisplayProps {
  currentImage: string | null;
  initials: string;
  uploading: boolean;
}

const ProfilePictureDisplay = ({ currentImage, initials, uploading }: ProfilePictureDisplayProps) => {
  return (
    <div className="relative">
      <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
        <AvatarImage src={currentImage || undefined} />
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      {uploading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
          <div className="text-white text-xs">Uploading...</div>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureDisplay;
