
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Plus } from 'lucide-react';

interface BannerSelectorProps {
  bannerUrl: string;
  onBannerClick: () => void;
}

const BannerSelector = ({ bannerUrl, onBannerClick }: BannerSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Event Banner</label>
      <div 
        className="relative h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
        onClick={onBannerClick}
      >
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="Selected banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ImageIcon className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">Click to select banner image</p>
            <p className="text-xs text-gray-400">Choose from stock images, AI generation, or upload</p>
          </div>
        )}
        
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
          <Plus className="h-4 w-4 text-gray-600" />
        </div>
      </div>
    </div>
  );
};

export default BannerSelector;
