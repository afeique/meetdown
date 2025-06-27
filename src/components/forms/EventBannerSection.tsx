
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BannerGenerator from '../BannerGenerator';
import ImageUpload from '../ImageUpload';
import ImageLibrary from '../ImageLibrary';

interface EventBannerSectionProps {
  bannerUrl: string;
  eventTitle: string;
  onBannerChange: (url: string) => void;
}

const EventBannerSection = ({ bannerUrl, eventTitle, onBannerChange }: EventBannerSectionProps) => {
  return (
    <div className="space-y-4">
      <label className="text-sm font-medium">Event Banner</label>
      <Tabs defaultValue="library" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="library">Image Library</TabsTrigger>
          <TabsTrigger value="ai">AI Generated</TabsTrigger>
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
        </TabsList>
        
        <TabsContent value="library" className="space-y-4">
          <ImageLibrary
            onImageSelected={onBannerChange}
            currentImage={bannerUrl}
          />
        </TabsContent>
        
        <TabsContent value="ai" className="space-y-4">
          <BannerGenerator
            eventTitle={eventTitle || "Untitled Event"}
            onBannerGenerated={onBannerChange}
            currentBanner={bannerUrl}
          />
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <ImageUpload
            onImageUploaded={onBannerChange}
            currentImage={bannerUrl}
            maxSizeMB={5}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventBannerSection;
