/**
 * Mock Data State Store.
 * Holds all in-memory items, conversations, messages, requests, and profiles.
 * Persisted via AsyncStorage so demo progress survives reloads.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  Item,
  Profile,
  Organization,
  Conversation,
  Message,
  DonationRequest,
} from '@/types';
import {
  SEED_PERSONAS,
  SEED_ORGANIZATIONS,
  SEED_ITEMS,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  SEED_DONATION_REQUESTS,
} from '@/services/mock/seed';

interface MockDataState {
  profiles: Profile[];
  organizations: Organization[];
  items: Item[];
  conversations: Conversation[];
  messages: Message[];
  donationRequests: DonationRequest[];

  // Mutations
  addItem: (item: Item) => void;
  updateItem: (id: string, updates: Partial<Item>) => void;
  removeItem: (id: string) => void;

  addConversation: (conv: Conversation) => void;
  addMessage: (msg: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;

  addDonationRequest: (req: DonationRequest) => void;
  updateDonationRequest: (id: string, updates: Partial<DonationRequest>) => void;
  incrementOrgReceived: (orgId: string) => void;

  addProfile: (profile: Profile) => void;
  addOrganization: (org: Organization) => void;

  resetToSeed: () => void;
}

export const useMockDataStore = create<MockDataState>()(
  persist(
    (set) => ({
      profiles: [...SEED_PERSONAS],
      organizations: [...SEED_ORGANIZATIONS],
      items: [...SEED_ITEMS],
      conversations: [...SEED_CONVERSATIONS],
      messages: [...SEED_MESSAGES],
      donationRequests: [...SEED_DONATION_REQUESTS],

      addItem: (item) =>
        set((state) => ({ items: [item, ...state.items] })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((it) => (it.id === id ? { ...it, ...updates } : it)),
        })),

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((it) => it.id !== id),
        })),

      addConversation: (conv) =>
        set((state) => {
          const exists = state.conversations.some(
            (c) =>
              c.id === conv.id ||
              (c.itemId === conv.itemId &&
                ((c.buyerId === conv.buyerId && c.sellerId === conv.sellerId) ||
                  (c.buyerId === conv.sellerId && c.sellerId === conv.buyerId))),
          );
          if (exists) return state;
          return { conversations: [conv, ...state.conversations] };
        }),

      addMessage: (msg) =>
        set((state) => {
          const exists = state.messages.some((m) => m.id === msg.id);
          if (exists) return state;
          return { messages: [...state.messages, msg] };
        }),

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),

      addDonationRequest: (req) =>
        set((state) => {
          const existingIndex = state.donationRequests.findIndex(
            (r) => r.id === req.id || (r.itemId === req.itemId && r.orgId === req.orgId),
          );
          if (existingIndex >= 0) {
            const updated = [...state.donationRequests];
            updated[existingIndex] = { ...updated[existingIndex], ...req };
            return { donationRequests: updated };
          }
          return { donationRequests: [...state.donationRequests, req] };
        }),

      updateDonationRequest: (id, updates) =>
        set((state) => ({
          donationRequests: state.donationRequests.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),

      incrementOrgReceived: (orgId) =>
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === orgId ? { ...org, itemsReceived: org.itemsReceived + 1 } : org,
          ),
        })),

      addProfile: (profile) =>
        set((state) => ({ profiles: [...state.profiles, profile] })),

      addOrganization: (org) =>
        set((state) => ({ organizations: [...state.organizations, org] })),

      resetToSeed: () =>
        set({
          profiles: [...SEED_PERSONAS],
          organizations: [...SEED_ORGANIZATIONS],
          items: [...SEED_ITEMS],
          conversations: [...SEED_CONVERSATIONS],
          messages: [...SEED_MESSAGES],
          donationRequests: [...SEED_DONATION_REQUESTS],
        }),
    }),
    {
      name: 'rehome_mock_data_store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Deduplicate donation requests by itemId + orgId
          const seen = new Set<string>();
          state.donationRequests = state.donationRequests.filter((r) => {
            const key = `${r.itemId}:${r.orgId}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          // Ensure SEED_MESSAGES for conv-4 exist if missing
          const msg401 = state.messages.some((m) => m.id === 'msg-401');
          if (!msg401) {
            state.messages = [
              ...state.messages,
              ...SEED_MESSAGES.filter((m) => m.conversationId === 'conv-4'),
            ];
          }

          // Ensure conv-4 exists if missing
          const conv4 = state.conversations.some((c) => c.id === 'conv-4');
          if (!conv4) {
            const seedConv4 = SEED_CONVERSATIONS.find((c) => c.id === 'conv-4');
            if (seedConv4) {
              state.conversations = [seedConv4, ...state.conversations];
            }
          }
        }
      },
    },
  ),
);
