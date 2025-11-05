/**
 * Date utility functions
 * Helper functions for formatting and manipulating dates
 */

/**
 * Format a date string or Date object to a readable format
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Convert a date to ISO string format (YYYY-MM-DD) for HTML date inputs
 * @param date - Date string or Date object
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date: string | Date | undefined): string => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toISOString().split('T')[0];
};

/**
 * Check if a date is in the future
 * @param date - Date string or Date object
 * @returns True if date is in the future
 */
export const isFutureDate = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

/**
 * Get the current year (useful for year validation in forms)
 * @returns Current year as a number
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

