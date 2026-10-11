/**
 * ReHome domain types.
 * These mirror the future database schema — keep names stable.
 */

export type ListingType = 'sell' | 'exchange' | 'donate';
export type Condition = 'new' | 'like_new' | 'good' | 'fair';
export type ItemStatus = 'active' | 'reserved' | 'completed' | 'removed';
export type Confidence = 'low' | 'medium' | 'high';

export interface Profile {
  id: string;
  displayName: string;
  city: string;
  role: 'user' | 'ngo';
  avatarColor: string;
}

export interface Organization {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  city: string;
  registrationNo: string;
  verified: boolean;
  itemsReceived: number;
}

export interface AiEstimate {
  min: number;
  max: number;
  confidence: Confidence;
  brand?: string;
  model?: string;
  reasoning: string;
  mock: true;
}

export interface Item {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  condition: Condition;
  listingType: ListingType;
  price?: number;
  ai?: AiEstimate;
  images: string[];
  city: string;
  status: ItemStatus;
  claimedByOrgId?: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  kind: 'text' | 'offer' | 'exchange' | 'system';
  body?: string;
  amount?: number;
  offeredItemId?: string;
  topupAmount?: number;
  topupPayerId?: string;
  status?: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface DonationRequest {
  id: string;
  itemId: string;
  orgId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface ProfileStats {
  itemsListed: number;
  dealsDone: number;
  itemsDonated: number;
}

/** App-wide typed error for service layer */
export type AppErrorCode =
  | 'NOT_FOUND'
  | 'NOT_AUTHORIZED'
  | 'NOT_VERIFIED'
  | 'VALIDATION'
  | 'MODERATION'
  | 'NETWORK'
  | 'UNKNOWN';

export class AppError extends Error {
  code: AppErrorCode;
  constructor(code: AppErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'AppError';
  }
}
