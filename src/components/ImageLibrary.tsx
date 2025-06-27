
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ImageGrid from './ImageLibrary/ImageGrid';

interface ImageLibraryProps {
  onImageSelected: (url: string) => void;
  currentImage?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageLibrary = ({ onImageSelected, currentImage, isOpen, onOpenChange }: ImageLibraryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);
  const { toast } = useToast();

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onImageSelected(imageUrl);
    onOpenChange(false);
    toast({
      title: "Image selected",
      description: "The selected image will be used as your event banner.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Choose Event Banner Image
          </DialogTitle>
        </DialogHeader>
        
        <ImageGrid
          selectedImage={selectedImage}
          onImageSelect={handleImageSelect}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageLibrary;
