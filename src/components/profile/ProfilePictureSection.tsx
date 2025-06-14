
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProfilePictureGenerator from '../ProfilePictureGenerator';

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

  const getInitials = () => {
    if (!profile) return 'U';
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onAvatarUpdate(publicUrl);
      
      toast({
        title: "Profile picture updated!",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Picture</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors shadow-lg">
              <Upload size={16} />
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowGenerator(!showGenerator)}
              className="flex items-center gap-2"
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowGenerator(!showGenerator)}
            >
              Generate AI Photo
            </Button>
          </div>
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
