export interface Housing {
  _id?: string;
  user?: string;
  listingType: 'room' | 'apartment' | 'spot_in_room';
  title: string;
  description: string;
  location: 'Orange County' | 'Los Angeles';
  address: string;
  price: number;
  gender?: 'men' | 'women' | 'any';
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  thumbnail?: string;
  images: string[];
  contactPhone: string;
  contactEmail: string;
  availableFrom: string;
  availableUntil?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Auto {
  _id?: string;
  user?: string;
  listingType: 'rent' | 'sale';
  make: string;
  model: string;
  year: number;
  location: 'Orange County' | 'Los Angeles';
  address: string;
  price: number;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  transmission: 'automatic' | 'manual';
  fuelType: 'gasoline' | 'electric' | 'hybrid' | 'diesel';
  description: string;
  thumbnail?: string;
  images: string[];
  contactPhone: string;
  contactEmail: string;
  availableFrom?: string;
  availableUntil?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Parcels {
  _id?: string;
  user?: string;
  direction: 'US_to_Kazakhstan' | 'Kazakhstan_to_US';
  travelDate: string;
  locationFrom: string;
  locationTo: string;
  maxWeight: number;
  maxDimensions: string;
  description: string;
  pricePerKg?: number;
  contactPhone: string;
  contactEmail: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  token: string;
}
