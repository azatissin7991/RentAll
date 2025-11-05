/**
 * Image utility functions
 * Helper functions for working with images and Cloudinary URLs
 */

/**
 * Combine thumbnail and images array, avoiding duplicates
 * Thumbnail is placed first if it's unique
 * 
 * @param thumbnail - Optional thumbnail URL
 * @param images - Array of image URLs
 * @returns Combined array of unique image URLs
 */
export const combineImages = (thumbnail?: string, images?: string[]): string[] => {
  const allImages: string[] = [];
  
  // Add thumbnail first if it exists and is unique
  if (thumbnail && !images?.includes(thumbnail)) {
    allImages.push(thumbnail);
  }
  
  // Add all images from images array
  if (images && images.length > 0) {
    allImages.push(...images);
  }
  
  return allImages;
};

/**
 * Get the image to display on a listing card
 * Uses thumbnail if available, otherwise falls back to first image
 * 
 * @param thumbnail - Optional thumbnail URL
 * @param images - Array of image URLs
 * @returns URL of the image to display, or null if no images
 */
export const getCardImage = (thumbnail?: string, images?: string[]): string | null => {
  if (thumbnail) return thumbnail;
  if (images && images.length > 0) return images[0];
  return null;
};

/**
 * Check if an image URL is valid
 * @param url - Image URL to validate
 * @returns True if URL is valid
 */
export const isValidImageUrl = (url: string | undefined | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

