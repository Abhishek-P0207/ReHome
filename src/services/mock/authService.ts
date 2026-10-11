/**
 * Mock Auth Service Implementation.
 */
import type { AuthService, SignUpParams, LogInParams } from '@/services/types';
import type { Profile } from '@/types';
import { useDemoStore } from '@/store/demoStore';
import { useMockDataStore } from '@/store/mockDataStore';
import { simulateLatency } from './utils';

export const mockAuthService: AuthService = {
  async signUp(params: SignUpParams): Promise<Profile> {
    await simulateLatency();

    const newId = `user-${Date.now()}`;
    const newProfile: Profile = {
      id: newId,
      displayName: params.name,
      city: params.city,
      role: params.role,
      avatarColor: params.role === 'ngo' ? '#B0306A' : '#1F9D7A',
    };

    useMockDataStore.getState().addProfile(newProfile);

    if (params.role === 'ngo' && params.orgName) {
      useMockDataStore.getState().addOrganization({
        id: `org-${Date.now()}`,
        ownerId: newId,
        name: params.orgName,
        description: 'New community organization.',
        city: params.city,
        registrationNo: params.registrationNo || 'PENDING',
        verified: false, // New NGOs start unverified
        itemsReceived: 0,
      });
    }

    useDemoStore.getState().setPersonaId(newId);
    return newProfile;
  },

  async logIn(params: LogInParams): Promise<Profile> {
    await simulateLatency();

    // Check if matching persona by email or default to current / first persona
    const { profiles } = useMockDataStore.getState();
    const found =
      profiles.find((p) => p.displayName.toLowerCase() === params.email.toLowerCase().split('@')[0]) ||
      profiles[0];

    useDemoStore.getState().setPersonaId(found.id);
    return found;
  },

  async logOut(): Promise<void> {
    await simulateLatency(200);
    // In mock demo, logging out can switch to guest or keep state
  },

  async getCurrentUser(): Promise<Profile | null> {
    await simulateLatency(150);
    const { currentPersonaId } = useDemoStore.getState();
    const { profiles } = useMockDataStore.getState();
    return profiles.find((p) => p.id === currentPersonaId) ?? profiles[0] ?? null;
  },

  async switchPersona(personaId: string): Promise<Profile> {
    await simulateLatency(200);
    const { profiles } = useMockDataStore.getState();
    const profile = profiles.find((p) => p.id === personaId);
    if (!profile) {
      throw new Error(`Persona ${personaId} not found`);
    }
    useDemoStore.getState().setPersonaId(personaId);
    return profile;
  },
};
