
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import BannerGenerator from '../BannerGenerator';
import ImageUpload from '../ImageUpload';
import ImageLibrary from '../ImageLibrary';
import BannerSelector from './BannerSelector';

interface EventBannerSectionProps {
  bannerUrl: string;
  eventTitle: string;
  onBannerChange: (url: string) => void;
}

const EventBannerSection = ({ bannerUrl, eventTitle, onBannerChange }: EventBannerSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImageLibraryOpen, setIsImageLibraryOpen] = useState(false);

  const handleBannerClick = () => {
    setIsModalOpen(true);
  };

  const handleImageLibrarySelect = () => {
    setIsModalOpen(false);
    setIsImageLibraryOpen(true);
  };

  return (
    <>
      <BannerSelector 
        bannerUrl={bannerUrl}
        onBannerClick={handleBannerClick}
      />

      {/* Main Banner Options Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Banner Option</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="library">Stock Images</TabsTrigger>
              <TabsTrigger value="ai">AI Generated</TabsTrigger>
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
            </TabsList>
            
            <TabsContent value="library" className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Browse our collection of high-quality stock images</p>
                <button
                  onClick={handleImageLibrarySelect}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Stock Images
                </button>
              </div>
            </TabsContent>
            
            <TabsContent value="ai" className="space-y-4">
              <BannerGenerator
                eventTitle={eventTitle || "Untitled Event"}
                onBannerGenerated={(url) => {
                  onBannerChange(url);
                  setIsModalOpen(false);
                }}
                currentBanner={bannerUrl}
              />
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <ImageUpload
                onImageUploaded={(url) => {
                  onBannerChange(url);
                  setIsModalOpen(false);
                }}
                currentImage={bannerUrl}
                maxSizeMB={5}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Image Library Modal */}
      <ImageLibrary
        onImageSelected={onBannerChange}
        currentImage={bannerUrl}
        isOpen={isImageLibraryOpen}
        onOpenChange={setIsImageLibraryOpen}
      />
    </>
  );
};

export default EventBannerSection;
