/**
 * Application-wide constants
 * Centralized location for shared values used across the application
 */

/**
 * Available locations for listings
 */
export const LOCATIONS = {
  ORANGE_COUNTY: 'Orange County',
  LOS_ANGELES: 'Los Angeles',
} as const;

export type Location = typeof LOCATIONS[keyof typeof LOCATIONS];

/**
 * Housing listing types
 */
export const HOUSING_LISTING_TYPES = {
  ROOM: 'room',
  APARTMENT: 'apartment',
  SPOT_IN_ROOM: 'spot_in_room',
} as const;

export type HousingListingType = typeof HOUSING_LISTING_TYPES[keyof typeof HOUSING_LISTING_TYPES];

/**
 * Auto listing types
 */
export const AUTO_LISTING_TYPES = {
  RENT: 'rent',
  SALE: 'sale',
} as const;

export type AutoListingType = typeof AUTO_LISTING_TYPES[keyof typeof AUTO_LISTING_TYPES];

/**
 * Parcel directions
 */
export const PARCEL_DIRECTIONS = {
  US_TO_KAZAKHSTAN: 'US_to_Kazakhstan',
  KAZAKHSTAN_TO_US: 'Kazakhstan_to_US',
} as const;

export type ParcelDirection = typeof PARCEL_DIRECTIONS[keyof typeof PARCEL_DIRECTIONS];

/**
 * Gender options for housing listings
 */
export const GENDER_OPTIONS = {
  MEN: 'men',
  WOMEN: 'women',
  ANY: 'any',
} as const;

export type GenderOption = typeof GENDER_OPTIONS[keyof typeof GENDER_OPTIONS];

/**
 * Auto condition options
 */
export const AUTO_CONDITIONS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
} as const;

export type AutoCondition = typeof AUTO_CONDITIONS[keyof typeof AUTO_CONDITIONS];

/**
 * Transmission types
 */
export const TRANSMISSION_TYPES = {
  AUTOMATIC: 'automatic',
  MANUAL: 'manual',
} as const;

export type TransmissionType = typeof TRANSMISSION_TYPES[keyof typeof TRANSMISSION_TYPES];

/**
 * Fuel types
 */
export const FUEL_TYPES = {
  GASOLINE: 'gasoline',
  ELECTRIC: 'electric',
  HYBRID: 'hybrid',
  DIESEL: 'diesel',
} as const;

export type FuelType = typeof FUEL_TYPES[keyof typeof FUEL_TYPES];

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  HOUSING: '/api/housing',
  AUTO: '/api/auto',
  PARCELS: '/api/parcels',
  CONTACT: '/api/contact',
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  HOME: '/',
  HOUSING: '/housing',
  AUTO: '/auto',
  PARCELS: '/parcels',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  MY_LISTINGS: '/my-listings',
} as const;

