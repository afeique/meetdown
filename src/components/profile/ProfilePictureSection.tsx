
import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X } from 'lucide-react';
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
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = () => {
    if (!profile) return 'U';
    const first = profile.first_name?.charAt(0) || '';
    const last = profile.last_name?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    
    try {
      // Create a preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { 
          cacheControl: '3600',
          upsert: false 
        });

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
      setPreview(null); // Clear preview since we now have the actual image
      
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
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage src={currentImage || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xl font-semibold">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="text-white text-xs">Uploading...</div>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Camera size={16} />
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowGenerator(!showGenerator)}
              disabled={uploading}
            >
              Generate AI Photo
            </Button>
            
            {currentImage && (
              <Button
                variant="outline"
                onClick={removePhoto}
                disabled={uploading}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <X size={16} />
                Remove
              </Button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
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
