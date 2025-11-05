import React from 'react';

interface ImageGalleryProps {
  images: string[];
  onImageClick: (index: number) => void;
  alt?: string;
}

/**
 * Image gallery component
 * Displays images in a responsive grid layout
 * 
 * @param images - Array of image URLs
 * @param onImageClick - Callback when an image is clicked
 * @param alt - Alt text for images
 */
export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onImageClick,
  alt = 'Image',
}) => {
  if (images.length === 0) return null;

  // Single image layout
  if (images.length === 1) {
    return (
      <div className="w-full p-4">
        <img
          src={images[0]}
          alt={alt}
          className="w-full h-64 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => onImageClick(0)}
        />
      </div>
    );
  }

  // Multiple images grid layout
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
      {images.map((image, index) => (
        <img
          key={index}
          src={image}
          alt={`${alt} ${index + 1}`}
          className={`w-full object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
            index === 0 ? 'md:col-span-2 md:row-span-2 h-64' : 'h-32'
          }`}
          onClick={() => onImageClick(index)}
        />
      ))}
    </div>
  );
};

