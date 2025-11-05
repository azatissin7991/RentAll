/**
 * Formatting utility functions
 * Helper functions for formatting numbers, strings, and other data types
 */

/**
 * Format a number as currency (USD)
 * @param amount - Number to format
 * @param options - Intl.NumberFormatOptions for customization
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }
): string => {
  return new Intl.NumberFormat('en-US', options).format(amount);
};

/**
 * Format a number with thousand separators
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1,234")
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

/**
 * Capitalize the first letter of each word
 * @param str - String to capitalize
 * @returns Capitalized string
 */
export const capitalizeWords = (str: string): string => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format listing type for display (replace underscores with spaces, capitalize)
 * @param listingType - Listing type string (e.g., "spot_in_room")
 * @returns Formatted string in Russian
 */
export const formatListingType = (listingType: string): string => {
  const translations: Record<string, string> = {
    'room': 'Комната',
    'apartment': 'Квартира',
    'spot_in_room': 'Место в комнате',
    'rent': 'Аренда',
    'sale': 'Продажа',
  };
  return translations[listingType] || listingType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

