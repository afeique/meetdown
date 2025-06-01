
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Upload, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterestTags from '@/components/InterestTags';
import { capitalizeFirstLetter, formatDisplayName } from '@/lib/nameUtils';
import UserProfileHeader from '@/components/UserProfileHeader';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        bio: data.bio || '',
        phone: data.phone || ''
      });
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...formData } : null);
      
      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    if (!profile) return 'U';
    const formattedFirst = capitalizeFirstLetter(profile.first_name);
    const formattedLast = capitalizeFirstLetter(profile.last_name);
    return `${formattedFirst?.charAt(0) || ''}${formattedLast?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-red-500 to-orange-500 bg-clip-text text-transparent">
                My Profile
              </h1>
            </div>
            <UserProfileHeader />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Profile Information Card */}
        <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Section */}
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
              <p className="text-sm text-gray-500">
                {uploading ? 'Uploading...' : 'Click to upload profile picture'}
              </p>
              {profile && (profile.first_name || profile.last_name) && (
                <p className="text-lg font-semibold text-gray-800">
                  {formatDisplayName(profile.first_name, profile.last_name)}
                </p>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Update Profile
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Social Links Card */}
        <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0 mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <User size={20} />
              Social
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Button
                onClick={() => navigate('/followers')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <User size={16} />
                View My Followers
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interests Section */}
        <InterestTags />
      </div>
    </div>
  );
};

export default Profile;
