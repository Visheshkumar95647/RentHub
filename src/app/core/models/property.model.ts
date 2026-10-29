
export type FurnishedStatus =
  | 'Furnished'
  | 'Semi-furnished'
  | 'Unfurnished';

export type LeaseType =
  | 'Long term'
  | 'Short term'
  | 'Both';

export type PriceMode =
  | 'Per Month'
  | 'Utilities included in rent';

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  monthlyRent: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  furnished: FurnishedStatus;
  vegetarianPreference: boolean;
  amenities: string[];
  images: string[];
  landlordId: string;
  landlordName: string;
  createdAt: string;

  // Additional rental listing fields
  propertyType?: string;
  buildingName?: string;
  isShared?: boolean;
  streetAddress?: string;
  leaseType?: LeaseType;
  negotiable?: boolean;
  priceMode?: PriceMode;
}

export interface PropertyComment {
  id: string;
  propertyId: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
  parentId: string | null;
}

export interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  city: string;
  monthlyRent: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  furnished: FurnishedStatus;
  vegetarianPreference: boolean;
  amenities: string[];
  images: string[];

  // Additional rental form fields
  propertyType?: string;
  buildingName?: string;
  isShared?: boolean;
  streetAddress?: string;
  leaseType?: LeaseType;
  negotiable?: boolean;
  priceMode?: PriceMode;
}
