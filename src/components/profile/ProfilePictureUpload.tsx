
import { useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePictureUploadProps {
  userId: string;
  uploading: boolean;
  onUploadStart: () => void;
  onUploadEnd: () => void;
  onPreviewSet: (preview: string | null) => void;
  onAvatarUpdate: (avatarUrl: string) => void;
}

const ProfilePictureUpload = ({
  userId,
  uploading,
  onUploadStart,
  onUploadEnd,
  onPreviewSet,
  onAvatarUpdate
}: ProfilePictureUploadProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    onUploadStart();
    
    try {
      // Create a preview
      const previewUrl = URL.createObjectURL(file);
      onPreviewSet(previewUrl);

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
      onPreviewSet(null); // Clear preview since we now have the actual image
      
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
      onPreviewSet(null);
    } finally {
      onUploadEnd();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      onChange={handleFileSelect}
      disabled={uploading}
      className="hidden"
    />
  );
};

export { ProfilePictureUpload };
export default ProfilePictureUpload;
