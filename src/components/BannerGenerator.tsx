
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Wand2, ImageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BannerGeneratorProps {
  eventTitle: string;
  onBannerGenerated: (imageUrl: string) => void;
  currentBanner?: string;
}

const BannerGenerator = ({ eventTitle, onBannerGenerated, currentBanner }: BannerGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(currentBanner || null);
  const { toast } = useToast();

  const generateBanner = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe what you want in the banner image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-event-banner', {
        body: {
          prompt: prompt.trim(),
          eventTitle: eventTitle
        }
      });

      if (error) {
        throw error;
      }

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        onBannerGenerated(data.imageUrl);
        toast({
          title: "Banner generated!",
          description: "Your AI-generated banner is ready.",
        });
      } else {
        throw new Error('No image URL returned');
      }
    } catch (error: any) {
      console.error('Error generating banner:', error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate banner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const useBanner = () => {
    if (generatedImage) {
      onBannerGenerated(generatedImage);
      toast({
        title: "Banner selected",
        description: "The generated banner will be used for your event.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          AI Banner Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Describe your banner image
          </label>
          <Input
            placeholder="e.g., people hiking on a mountain trail, coffee cups and laptops, yoga in a park..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
          />
        </div>

        <Button 
          onClick={generateBanner} 
          disabled={isGenerating || !prompt.trim()}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Banner...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate Banner
            </>
          )}
        </Button>

        {generatedImage && (
          <div className="space-y-3">
            <div className="relative">
              <img 
                src={generatedImage} 
                alt="Generated banner"
                className="w-full h-48 object-cover rounded-lg border"
              />
            </div>
            <Button 
              onClick={useBanner} 
              variant="outline" 
              className="w-full"
            >
              Use This Banner
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BannerGenerator;
