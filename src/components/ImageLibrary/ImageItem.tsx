
import { Check } from 'lucide-react';
import { ImageData } from '@/data/imageLibraryData';

interface ImageItemProps {
  image: ImageData;
  isSelected: boolean;
  onSelect: (imageUrl: string) => void;
}

const ImageItem = ({ image, isSelected, onSelect }: ImageItemProps) => {
  return (
    <div
      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => onSelect(image.url)}
    >
      <img
        src={image.url}
        alt={image.alt}
        className="w-full h-24 object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-white text-xs font-medium">{image.category}</p>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
};

export default ImageItem;
