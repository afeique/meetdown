import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Image as ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
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

  // Updated library with fixed URLs and no duplicates
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
      url: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&h=400&fit=crop',
      alt: 'Group fitness class',
      category: 'Fitness'
    },
    {
      id: '8',
      url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=400&fit=crop',
      alt: 'Delicious pizza',
      category: 'Food'
    },
    {
      id: '9',
      url: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800&h=400&fit=crop',
      alt: 'Basketball court',
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
    },
    {
      id: '21',
      url: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop',
      alt: 'Coffee shop interior',
      category: 'Cafe'
    },
    {
      id: '22',
      url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop',
      alt: 'Books and learning',
      category: 'Education'
    },
    {
      id: '23',
      url: 'https://images.unsplash.com/photo-1496128858413-b36217c2ce36?w=800&h=400&fit=crop',
      alt: 'Startup office space',
      category: 'Startup'
    },
    {
      id: '24',
      url: 'https://images.unsplash.com/photo-1511376777868-611b54f68947?w=800&h=400&fit=crop',
      alt: 'Conference presentation',
      category: 'Conference'
    },
    {
      id: '25',
      url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop',
      alt: 'Networking event',
      category: 'Networking'
    },
    {
      id: '26',
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop',
      alt: 'Workshop setting',
      category: 'Workshop'
    },
    {
      id: '27',
      url: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=800&h=400&fit=crop',
      alt: 'Creative workspace',
      category: 'Creative'
    },
    {
      id: '28',
      url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop',
      alt: 'Business meeting',
      category: 'Meeting'
    },
    {
      id: '29',
      url: 'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&h=400&fit=crop',
      alt: 'Professional woman',
      category: 'Professional'
    },
    {
      id: '30',
      url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop',
      alt: 'City skyline',
      category: 'Urban'
    },
    {
      id: '31',
      url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=400&fit=crop',
      alt: 'Team brainstorming',
      category: 'Innovation'
    },
    {
      id: '32',
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=400&fit=crop',
      alt: 'Modern office',
      category: 'Corporate'
    },
    {
      id: '33',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=400&fit=crop',
      alt: 'Social gathering',
      category: 'Social'
    },
    {
      id: '34',
      url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop',
      alt: 'Party celebration',
      category: 'Party'
    },
    {
      id: '35',
      url: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=400&fit=crop',
      alt: 'Sunset landscape',
      category: 'Scenic'
    },
    {
      id: '36',
      url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop',
      alt: 'Shopping and retail',
      category: 'Retail'
    },
    {
      id: '37',
      url: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&h=400&fit=crop',
      alt: 'Health and wellness',
      category: 'Wellness'
    },
    {
      id: '38',
      url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=400&fit=crop',
      alt: 'Hiking trail in mountains',
      category: 'Outdoor'
    },
    {
      id: '39',
      url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=400&fit=crop',
      alt: 'Travel destination',
      category: 'Travel'
    },
    {
      id: '40',
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop',
      alt: 'Learning environment',
      category: 'Learning'
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
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Choose Event Banner Image
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ImageLibrary;
