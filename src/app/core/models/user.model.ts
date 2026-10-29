
export type UserRole = 'user' | 'landlord' | 'admin';

export type PromotionStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role: UserRole;

  promotionStatus?: PromotionStatus;
  promotionMessage?: string;
  promotionRequestedAt?: string;
  promotionReviewedAt?: string;
}

export type AuthUser = Omit<User, 'password'>;
