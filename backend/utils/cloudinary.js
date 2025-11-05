import { v2 as cloudinary } from 'cloudinary';

// Note: dotenv.config() is already called in server.js, so env vars should be available
// If running this file directly for testing, uncomment the line below:
// import dotenv from 'dotenv'; dotenv.config();

// Configure Cloudinary with Admin API credentials
// Check for both VITE_ prefixed (if shared with frontend) and non-prefixed versions
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract public ID from Cloudinary URL
 * Cloudinary URLs format: 
 * - https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
 * - https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}
 * - https://res.cloudinary.com/{cloud_name}/image/upload/{folder}/{public_id}
 * - https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
 * 
 * The public ID can include folders (e.g., "rentall/image1")
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') {
    console.warn('extractPublicId: Invalid URL provided');
    return null;
  }
  
  try {
    console.log(`Extracting public ID from URL: ${url}`);
    
    // Extract everything after /image/upload/ up to file extension or query params
    // Skip version prefix (v1234567890) if present
    // Handle transformations (w_500,h_300, etc.) and folders
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const uploadIndex = pathParts.indexOf('upload');
    
    if (uploadIndex === -1 || uploadIndex === pathParts.length - 1) {
      console.warn('extractPublicId: Could not find "upload" in URL path');
      return null;
    }
    
    // Get everything after 'upload'
    let pathAfterUpload = pathParts.slice(uploadIndex + 1).join('/');
    console.log(`Path after upload: ${pathAfterUpload}`);
    
    // Remove version prefix if present (starts with 'v' followed by digits)
    const originalPath = pathAfterUpload;
    pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    if (originalPath !== pathAfterUpload) {
      console.log(`Removed version prefix, new path: ${pathAfterUpload}`);
    }
    
    // Remove file extension if present
    const pathBeforeExtension = pathAfterUpload;
    pathAfterUpload = pathAfterUpload.replace(/\.[^.]+$/, '');
    if (pathBeforeExtension !== pathAfterUpload) {
      console.log(`Removed file extension, new path: ${pathAfterUpload}`);
    }
    
    // The remaining path is the public ID (may include folders)
    // Note: Cloudinary uploads typically store the base public ID without transformations
    // If transformations are somehow in the stored URL, they would need to be removed
    // For now, we'll use the path as-is since uploads should store clean URLs
    const publicId = pathAfterUpload || null;
    console.log(`Final extracted public ID: ${publicId}`);
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID from URL:', url, error);
    return null;
  }
};

/**
 * Delete a single image from Cloudinary
 */
const deleteImage = async (url) => {
  if (!url) {
    console.warn('deleteImage: No URL provided');
    return;
  }
  
  console.log(`Attempting to delete image: ${url}`);
  
  const publicId = extractPublicId(url);
  if (!publicId) {
    console.warn('Could not extract public ID from URL:', url);
    return;
  }
  
  console.log(`Extracted public ID: ${publicId}`);
  
  try {
    // Check if Cloudinary is configured
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    // Debug: Log what env vars are found (without exposing secrets)
    console.log('Cloudinary env check:', {
      'CLOUDINARY_CLOUD_NAME': !!process.env.CLOUDINARY_CLOUD_NAME,
      'VITE_CLOUDINARY_CLOUD_NAME': !!process.env.VITE_CLOUDINARY_CLOUD_NAME,
      'cloudName (resolved)': !!cloudName,
      'CLOUDINARY_API_KEY': !!apiKey,
      'CLOUDINARY_API_KEY length': apiKey ? apiKey.length : 0,
      'CLOUDINARY_API_SECRET': !!apiSecret,
      'CLOUDINARY_API_SECRET length': apiSecret ? apiSecret.length : 0,
      'cloudName value': cloudName || 'NOT SET',
    });
    
    if (!cloudName || !apiKey || !apiSecret) {
      console.warn('Cloudinary Admin API not configured. Missing:', {
        cloud_name: !!cloudName,
        api_key: !!apiKey,
        api_secret: !!apiSecret,
      });
      console.warn('Make sure these are in your backend .env file:');
      console.warn('  CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_CLOUD_NAME');
      console.warn('  CLOUDINARY_API_KEY');
      console.warn('  CLOUDINARY_API_SECRET');
      return;
    }
    
    console.log(`Deleting from Cloudinary with cloud_name: ${cloudName}`);
    
    // Reconfigure Cloudinary with the resolved values to ensure they're set correctly
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true, // Also invalidate CDN cache
    });
    
    if (result.result === 'ok') {
      console.log(`Successfully deleted image from Cloudinary: ${publicId}`);
    } else if (result.result === 'not found') {
      console.warn(`Image not found in Cloudinary (may have been deleted already): ${publicId}`);
    } else {
      console.warn(`Unexpected result from Cloudinary delete: ${result.result} for ${publicId}`);
    }
  } catch (error) {
    // Log error but don't throw - we don't want to fail listing deletion if image deletion fails
    console.error(`Failed to delete image from Cloudinary (${publicId}):`, error.message);
    console.error('Full error:', error);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} urls - Array of Cloudinary image URLs
 */
export const deleteCloudinaryImages = async (urls) => {
  if (!urls || !Array.isArray(urls) || urls.length === 0) return;
  
  // Delete all images in parallel
  await Promise.all(urls.map(url => deleteImage(url)));
};

/**
 * Delete images from a listing (thumbnail + images array)
 * @param {Object} listing - Listing object with thumbnail and images fields
 */
export const deleteListingImages = async (listing) => {
  if (!listing) {
    console.warn('deleteListingImages: No listing provided');
    return;
  }
  
  console.log('deleteListingImages called for listing:', listing._id);
  
  const urlsToDelete = [];
  
  // Add thumbnail if exists
  if (listing.thumbnail) {
    console.log('Found thumbnail:', listing.thumbnail);
    urlsToDelete.push(listing.thumbnail);
  }
  
  // Add all images from images array
  if (listing.images && Array.isArray(listing.images)) {
    console.log(`Found ${listing.images.length} images in array`);
    urlsToDelete.push(...listing.images);
  }
  
  console.log(`Total URLs to delete: ${urlsToDelete.length}`);
  
  if (urlsToDelete.length > 0) {
    await deleteCloudinaryImages(urlsToDelete);
  } else {
    console.warn('No images found to delete for listing:', listing._id);
  }
};

