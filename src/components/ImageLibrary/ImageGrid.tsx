
import { ScrollArea } from '@/components/ui/scroll-area';
import { imageLibraryData } from '@/data/imageLibraryData';
import ImageItem from './ImageItem';

interface ImageGridProps {
  selectedImage: string | null;
  onImageSelect: (imageUrl: string) => void;
}

const ImageGrid = ({ selectedImage, onImageSelect }: ImageGridProps) => {
  return (
    <ScrollArea className="h-[60vh] w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        {imageLibraryData.map((image) => (
          <ImageItem
            key={image.id}
            image={image}
            isSelected={selectedImage === image.url}
            onSelect={onImageSelect}
          />
        ))}
      </div>
    </ScrollArea>
  );
};

export default ImageGrid;
