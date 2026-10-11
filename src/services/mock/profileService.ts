/**
 * Mock Profile Service Implementation.
 */
import type { ProfileService, ProfileStats } from '@/services/types';
import type { Profile, Organization } from '@/types';
import { AppError } from '@/types';
import { useDemoStore } from '@/store/demoStore';
import { useMockDataStore } from '@/store/mockDataStore';
import { simulateLatency } from './utils';

export const mockProfileService: ProfileService = {
  async getProfile(userId?: string): Promise<Profile> {
    await simulateLatency(150);

    const { currentPersonaId } = useDemoStore.getState();
    const id = userId ?? currentPersonaId;
    const profile = useMockDataStore.getState().profiles.find((p) => p.id === id);

    if (!profile) {
      throw new AppError('NOT_FOUND', `Profile for user ${id} not found.`);
    }

    return profile;
  },

  async getOrganization(orgId: string): Promise<Organization | null> {
    await simulateLatency(150);

    return (
      useMockDataStore.getState().organizations.find((o) => o.id === orgId) ?? null
    );
  },

  async getStats(userId?: string): Promise<ProfileStats> {
    await simulateLatency(200);

    const { currentPersonaId } = useDemoStore.getState();
    const id = userId ?? currentPersonaId;
    const { items } = useMockDataStore.getState();

    const userItems = items.filter((i) => i.ownerId === id);
    const itemsListed = userItems.length;
    const dealsDone = userItems.filter((i) => i.status === 'completed').length;
    const itemsDonated = userItems.filter(
      (i) => i.listingType === 'donate' && i.status === 'completed',
    ).length;

    return {
      itemsListed,
      dealsDone,
      itemsDonated,
    };
  },
};
