
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfilePictureGenerator from '../ProfilePictureGenerator';
import ProfilePictureDisplay from './ProfilePictureDisplay';
import ProfilePictureActions from './ProfilePictureActions';
import ProfilePictureUpload from './ProfilePictureUpload';

interface ProfilePictureSectionProps {
  profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
  userId: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

const ProfilePictureSection = ({ profile, userId, onAvatarUpdate }: ProfilePictureSectionProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const getInitials = () => {
    if (!profile) return 'U';
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const removePhoto = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', userId);

      if (error) throw error;

      onAvatarUpdate('');
      setPreview(null);
      
      toast({
        title: "Profile picture removed",
        description: "Your profile picture has been removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing photo",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProfilePictureGenerated = async (imageUrl: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: imageUrl })
        .eq('id', userId);

      if (error) throw error;

      onAvatarUpdate(imageUrl);
      setShowGenerator(false);
      
      toast({
        title: "Profile picture updated!",
        description: "Your AI-generated profile picture has been set.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile picture",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const currentImage = preview || profile?.avatar_url;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <ProfilePictureDisplay
            currentImage={currentImage}
            initials={getInitials()}
            uploading={uploading}
          />
          
          <ProfilePictureActions
            uploading={uploading}
            currentImage={currentImage}
            onUploadClick={() => {
              const upload = document.querySelector('input[type="file"]') as HTMLInputElement;
              upload?.click();
            }}
            onGenerateClick={() => setShowGenerator(!showGenerator)}
            onRemoveClick={removePhoto}
          />
          
          <ProfilePictureUpload
            userId={userId}
            uploading={uploading}
            onUploadStart={() => setUploading(true)}
            onUploadEnd={() => setUploading(false)}
            onPreviewSet={setPreview}
            onAvatarUpdate={onAvatarUpdate}
          />
          
          <p className="text-xs text-gray-500 text-center">
            Supported formats: JPG, PNG, WebP, GIF. Max size: 5MB
          </p>
        </div>

        {showGenerator && (
          <ProfilePictureGenerator
            onProfilePictureGenerated={handleProfilePictureGenerated}
            currentAvatar={profile?.avatar_url || undefined}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePictureSection;
