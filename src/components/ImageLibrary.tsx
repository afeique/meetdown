
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Image as ImageIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ImageLibraryProps {
  onImageSelected: (url: string) => void;
  currentImage?: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ImageLibrary = ({ onImageSelected, currentImage, isOpen, onOpenChange }: ImageLibraryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);
  const { toast } = useToast();

  // Expanded library of pre-selected images with verified URLs and unique categories
  const imageLibrary = [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop',
      alt: 'People working on laptops',
      category: 'Business'
    },
    {
      id: '2', 
      url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop',
      alt: 'Laptop and coffee setup',
      category: 'Technology'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
      alt: 'Technology and circuits',
      category: 'Development'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
      alt: 'Programming code',
      category: 'Programming'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
      alt: 'Person using MacBook',
      category: 'Work'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
      alt: 'Mountain landscape',
      category: 'Nature'
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&h=400&fit=crop',
      alt: 'People exercising in gym',
      category: 'Fitness'
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop',
      alt: 'Fresh pizza with ingredients',
      category: 'Food'
    },
    {
      id: '9',
      url: 'https://images.unsplash.com/photo-1571019613914-85c3f2b1b2a1?w=800&h=400&fit=crop',
      alt: 'Group workout',
      category: 'Sports'
    },
    {
      id: '10',
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
      alt: 'Live music performance',
      category: 'Music'
    },
    {
      id: '11',
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop',
      alt: 'Art and creativity',
      category: 'Art'
    },
    {
      id: '12',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop',
      alt: 'Community gathering',
      category: 'Community'
    },
    {
      id: '13',
      url: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800&h=400&fit=crop',
      alt: 'Ocean wave at beach',
      category: 'Beach'
    },
    {
      id: '14',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&h=400&fit=crop',
      alt: 'Body of water surrounded by trees',
      category: 'Landscape'
    },
    {
      id: '15',
      url: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&h=400&fit=crop',
      alt: 'Orange flowers',
      category: 'Flowers'
    },
    {
      id: '16',
      url: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?w=800&h=400&fit=crop',
      alt: 'Modern building with wavy lines',
      category: 'Architecture'
    },
    {
      id: '17',
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop',
      alt: 'Digital matrix background',
      category: 'Digital'
    },
    {
      id: '18',
      url: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=400&fit=crop',
      alt: 'Modern living room interior',
      category: 'Interior'
    },
    {
      id: '19',
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
      alt: 'Data analytics dashboard',
      category: 'Analytics'
    },
    {
      id: '20',
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
      alt: 'Team collaboration meeting',
      category: 'Teamwork'
    }
  ];

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
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Choose Event Banner Image
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {imageLibrary.map((image) => (
            <div
              key={image.id}
              className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                selectedImage === image.url
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleImageSelect(image.url)}
            >
              <img
                src={image.url}
                alt={image.alt}
                className="w-full h-24 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs font-medium">{image.category}</p>
              </div>
              {selectedImage === image.url && (
                <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageLibrary;
