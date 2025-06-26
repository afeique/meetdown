
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Image as ImageIcon } from 'lucide-react';

interface ImageLibraryProps {
  onImageSelected: (url: string) => void;
  currentImage?: string;
}

const ImageLibrary = ({ onImageSelected, currentImage }: ImageLibraryProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImage || null);
  const { toast } = useToast();

  // Library of pre-selected images
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
      category: 'Tech'
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop',
      alt: 'Technology and circuits',
      category: 'Tech'
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
      alt: 'Programming code',
      category: 'Development'
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=400&fit=crop',
      alt: 'Person using MacBook',
      category: 'Business'
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop',
      alt: 'Mountain landscape',
      category: 'Nature'
    },
    {
      id: '7',
      url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&h=400&fit=crop',
      alt: 'Yoga and wellness',
      category: 'Health'
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop',
      alt: 'Healthy food',
      category: 'Food'
    },
    {
      id: '9',
      url: 'https://images.unsplash.com/photo-1571019613914-85c3f2b1b2a1?w=800&h=400&fit=crop',
      alt: 'Group workout',
      category: 'Fitness'
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
    }
  ];

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onImageSelected(imageUrl);
    toast({
      title: "Image selected",
      description: "The selected image will be used as your event banner.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-5 w-5" />
        <label className="text-sm font-medium">Choose from Image Library</label>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        {imageLibrary.map((image) => (
          <div
            key={image.id}
            className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
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

      {selectedImage && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Selected banner preview:</p>
          <img
            src={selectedImage}
            alt="Selected banner"
            className="w-full h-32 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  );
};

export default ImageLibrary;
