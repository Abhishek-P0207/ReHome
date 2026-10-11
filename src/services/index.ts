/**
 * Services Container.
 * The ONLY layer that touches data in ReHome.
 *
 * Chooses active service implementation based on EXPO_PUBLIC_USE_MOCKS (default: true).
 * When real backend is plugged in, only this directory is updated.
 */
import type { Services } from './types';
import { mockAuthService } from './mock/authService';
import { mockItemsService } from './mock/itemsService';
import { mockAiService } from './mock/aiService';
import { mockChatService } from './mock/chatService';
import { mockExchangeService } from './mock/exchangeService';
import { mockDonationsService } from './mock/donationsService';
import { mockProfileService } from './mock/profileService';

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS !== 'false';

export const services: Services = USE_MOCKS
  ? {
      auth: mockAuthService,
      items: mockItemsService,
      ai: mockAiService,
      chat: mockChatService,
      exchange: mockExchangeService,
      donations: mockDonationsService,
      profile: mockProfileService,
    }
  : {
      // Future real services implementation plug-in point
      auth: mockAuthService,
      items: mockItemsService,
      ai: mockAiService,
      chat: mockChatService,
      exchange: mockExchangeService,
      donations: mockDonationsService,
      profile: mockProfileService,
    };

export const {
  auth: authService,
  items: itemsService,
  ai: aiService,
  chat: chatService,
  exchange: exchangeService,
  donations: donationsService,
  profile: profileService,
} = services;

export * from './types';
