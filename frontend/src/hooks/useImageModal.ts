import { useState, useEffect } from 'react';

/**
 * Custom hook for managing full-screen image modal
 * Handles image selection, navigation, and keyboard controls
 * 
 * @param images - Array of image URLs
 * @returns Object with modal state and control functions
 */
export const useImageModal = (images: string[]) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  /**
   * Open the modal with a specific image
   * @param index - Index of the image to display
   */
  const openModal = (index: number) => {
    if (index >= 0 && index < images.length) {
      setSelectedImageIndex(index);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  };

  /**
   * Close the modal
   */
  const closeModal = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'unset';
  };

  /**
   * Navigate to the next image
   */
  const nextImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex < images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  /**
   * Navigate to the previous image
   */
  const prevImage = () => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  /**
   * Handle keyboard navigation
   * Arrow keys for navigation, Escape to close
   */
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowRight' && selectedImageIndex < images.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1);
      } else if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, images.length]);

  return {
    selectedImageIndex,
    openModal,
    closeModal,
    nextImage,
    prevImage,
    isOpen: selectedImageIndex !== null,
    currentImage: selectedImageIndex !== null ? images[selectedImageIndex] : null,
    totalImages: images.length,
  };
};

