
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface ProfilePictureActionsProps {
  uploading: boolean;
  currentImage: string | null;
  onUploadClick: () => void;
  onGenerateClick: () => void;
  onRemoveClick: () => void;
}

const ProfilePictureActions = ({
  uploading,
  currentImage,
  onUploadClick,
  onGenerateClick,
  onRemoveClick
}: ProfilePictureActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button
        variant="outline"
        onClick={onUploadClick}
        disabled={uploading}
        className="flex items-center gap-2"
      >
        <Camera size={16} />
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </Button>
      
      <Button
        variant="outline"
        onClick={onGenerateClick}
        disabled={uploading}
      >
        Generate AI Photo
      </Button>
      
      {currentImage && (
        <Button
          variant="outline"
          onClick={onRemoveClick}
          disabled={uploading}
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
        >
          <X size={16} />
          Remove
        </Button>
      )}
    </div>
  );
};

export default ProfilePictureActions;
