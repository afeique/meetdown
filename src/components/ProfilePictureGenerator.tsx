
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Wand2, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

interface ProfilePictureGeneratorProps {
  onProfilePictureGenerated: (imageUrl: string) => void;
  currentAvatar?: string;
}

const ProfilePictureGenerator = ({ onProfilePictureGenerated, currentAvatar }: ProfilePictureGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(currentAvatar || null);
  const { toast } = useToast();
  const { user } = useAuth();

  const generateProfilePicture = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe what you want in your profile picture.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to generate a profile picture.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-profile-picture', {
        body: {
          prompt: `Professional profile picture: ${prompt.trim()}`,
          userId: user.id
        }
      });

      if (error) {
        throw error;
      }

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        onProfilePictureGenerated(data.imageUrl);
        toast({
          title: "Profile picture generated!",
          description: "Your AI-generated profile picture is ready.",
        });
      } else {
        throw new Error('No image URL returned');
      }
    } catch (error: any) {
      console.error('Error generating profile picture:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Profile Picture Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Describe your ideal profile picture
          </label>
          <Input
            placeholder="e.g., smiling person with glasses, business professional, casual outdoor portrait..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <Button 
          onClick={generateProfilePicture} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Picture...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate Profile Picture
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-3">
            <div className="relative">
              <img 
                src={generatedImage} 
                alt="Generated profile picture"
                className="w-32 h-32 object-cover rounded-full border mx-auto"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfilePictureGenerator;
