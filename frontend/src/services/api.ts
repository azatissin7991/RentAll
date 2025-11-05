/**
 * API Service Module
 * 
 * Centralized API client for all backend communication.
 * Handles authentication, error handling, and data transformation.
 * 
 * @module services/api
 */

import type { Housing, Auto, Parcels } from '../types';

/**
 * Contact form data structure
 */
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

/** Base URL for all API endpoints */
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Get authentication token from localStorage
 * @returns JWT token string or null if not authenticated
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * Housing API Client
 * Provides CRUD operations for housing listings
 */
export const housingApi = {
  /**
   * Fetch all active housing listings
   * @returns Promise resolving to array of housing listings
   * @throws Error if request fails or backend is unavailable
   */
  getAll: async (): Promise<Housing[]> => {
    try {
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/housing`, { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch housing: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to backend. Make sure the server is running on http://localhost:5000');
      }
      throw error;
    }
  },
  
  /**
   * Fetch a single housing listing by ID
   * @param id - Housing listing ID
   * @returns Promise resolving to housing listing
   * @throws Error if listing not found or request fails
   */
  getById: async (id: string): Promise<Housing> => {
    const response = await fetch(`${API_BASE_URL}/housing/${id}`);
    if (!response.ok) throw new Error('Failed to fetch housing');
    return response.json();
  },
  
  /**
   * Create a new housing listing
   * Requires authentication
   * @param data - Housing listing data (without generated fields)
   * @returns Promise resolving to created housing listing
   * @throws Error if creation fails or user is not authenticated
   */
  create: async (data: Omit<Housing, '_id' | 'createdAt' | 'updatedAt' | 'user'>): Promise<Housing> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/housing`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create housing');
    return response.json();
  },
  
  /**
   * Update an existing housing listing
   * Requires authentication and ownership
   * @param id - Housing listing ID
   * @param data - Partial housing data to update
   * @returns Promise resolving to updated housing listing
   * @throws Error if update fails or user is not authorized
   */
  update: async (id: string, data: Partial<Housing>): Promise<Housing> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/housing/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update housing');
    return response.json();
  },
  
  /**
   * Delete a housing listing
   * Requires authentication and ownership
   * Also deletes associated Cloudinary images
   * @param id - Housing listing ID
   * @returns Promise resolving when deletion is complete
   * @throws Error if deletion fails or user is not authorized
   */
  delete: async (id: string): Promise<void> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/housing/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) throw new Error('Failed to delete housing');
  },
  
  /**
   * Fetch all housing listings owned by the authenticated user
   * Requires authentication
   * @returns Promise resolving to array of user's housing listings
   * @throws Error if request fails or user is not authenticated
   */
  getMyListings: async (): Promise<Housing[]> => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_BASE_URL}/housing/my-listings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch your housing listings');
    return response.json();
  },
};

/**
 * Auto API Client
 * Provides CRUD operations for auto listings
 */
export const autoApi = {
  /**
   * Fetch all active auto listings
   * @returns Promise resolving to array of auto listings
   * @throws Error if request fails or backend is unavailable
   */
  getAll: async (): Promise<Auto[]> => {
    try {
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/auto`, { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch auto: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to backend. Make sure the server is running on http://localhost:5000');
      }
      throw error;
    }
  },
  
  /**
   * Fetch a single auto listing by ID
   * @param id - Auto listing ID
   * @returns Promise resolving to auto listing
   * @throws Error if listing not found or request fails
   */
  getById: async (id: string): Promise<Auto> => {
    const response = await fetch(`${API_BASE_URL}/auto/${id}`);
    if (!response.ok) throw new Error('Failed to fetch auto');
    return response.json();
  },
  
  /**
   * Create a new auto listing
   * Requires authentication
   * @param data - Auto listing data (without generated fields)
   * @returns Promise resolving to created auto listing
   * @throws Error if creation fails or user is not authenticated
   */
  create: async (data: Omit<Auto, '_id' | 'createdAt' | 'updatedAt' | 'user'>): Promise<Auto> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/auto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create auto');
    return response.json();
  },
  
  /**
   * Update an existing auto listing
   * Requires authentication and ownership
   * @param id - Auto listing ID
   * @param data - Partial auto data to update
   * @returns Promise resolving to updated auto listing
   * @throws Error if update fails or user is not authorized
   */
  update: async (id: string, data: Partial<Auto>): Promise<Auto> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/auto/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update auto');
    return response.json();
  },
  
  /**
   * Delete an auto listing
   * Requires authentication and ownership
   * Also deletes associated Cloudinary images
   * @param id - Auto listing ID
   * @returns Promise resolving when deletion is complete
   * @throws Error if deletion fails or user is not authorized
   */
  delete: async (id: string): Promise<void> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/auto/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) throw new Error('Failed to delete auto');
  },
  
  /**
   * Fetch all auto listings owned by the authenticated user
   * Requires authentication
   * @returns Promise resolving to array of user's auto listings
   * @throws Error if request fails or user is not authenticated
   */
  getMyListings: async (): Promise<Auto[]> => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_BASE_URL}/auto/my-listings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch your auto listings');
    return response.json();
  },
};

/**
 * Parcels API Client
 * Provides CRUD operations for parcel listings
 */
export const parcelsApi = {
  /**
   * Fetch all active parcel listings
   * @returns Promise resolving to array of parcel listings
   * @throws Error if request fails or backend is unavailable
   */
  getAll: async (): Promise<Parcels[]> => {
    try {
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(`${API_BASE_URL}/parcels`, { headers });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch parcels: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to backend. Make sure the server is running on http://localhost:5000');
      }
      throw error;
    }
  },
  
  getById: async (id: string): Promise<Parcels> => {
    const response = await fetch(`${API_BASE_URL}/parcels/${id}`);
    if (!response.ok) throw new Error('Failed to fetch parcel');
    return response.json();
  },
  
  create: async (data: Omit<Parcels, '_id' | 'createdAt' | 'updatedAt' | 'user'>): Promise<Parcels> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/parcels`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create parcel');
    return response.json();
  },
  
  update: async (id: string, data: Partial<Parcels>): Promise<Parcels> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/parcels/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update parcel');
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/parcels/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    });
    if (!response.ok) throw new Error('Failed to delete parcel');
  },
  
  getMyListings: async (): Promise<Parcels[]> => {
    const token = getToken();
    if (!token) throw new Error('Not authenticated');
    const response = await fetch(`${API_BASE_URL}/parcels/my-listings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch your parcel listings');
    return response.json();
  },
};

/**
 * Contact API Client
 * Handles contact form submissions
 */
export const contactApi = {
  /**
   * Submit a contact form
   * Public endpoint, no authentication required
   * @param data - Contact form data
   * @returns Promise resolving when submission is complete
   * @throws Error if submission fails
   */
  submit: async (data: ContactFormData): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to submit contact form');
    }
  },
};

