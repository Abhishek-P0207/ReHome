/**
 * Mock Donations Service Implementation.
 * Enforces business rule: Only verified NGOs can request donate items.
 * Accepting request marks item completed, credits NGO itemsReceived, and declines others.
 */
import type { DonationsService } from '@/services/types';
import type { Organization, DonationRequest } from '@/types';
import { AppError } from '@/types';
import { useDemoStore } from '@/store/demoStore';
import { useMockDataStore } from '@/store/mockDataStore';
import { simulateLatency } from './utils';

export const mockDonationsService: DonationsService = {
  async listOrganizations(): Promise<Organization[]> {
    await simulateLatency();
    return useMockDataStore.getState().organizations;
  },

  async getOrganization(id: string): Promise<Organization> {
    await simulateLatency();

    const org = useMockDataStore.getState().organizations.find((o) => o.id === id);
    if (!org) {
      throw new AppError('NOT_FOUND', `Organization with ID ${id} not found.`);
    }
    return org;
  },

  async requestItem(itemId: string): Promise<DonationRequest> {
    await simulateLatency(400);

    const { currentPersonaId } = useDemoStore.getState();
    const { organizations, items, donationRequests, conversations } =
      useMockDataStore.getState();

    // Find the organization owned by the current persona
    const org = organizations.find((o) => o.ownerId === currentPersonaId);
    if (!org) {
      throw new AppError(
        'NOT_AUTHORIZED',
        'You must represent an organization to request donated items.',
      );
    }

    if (!org.verified) {
      throw new AppError(
        'NOT_VERIFIED',
        'Your organization verification is pending. You can claim items once approved.',
      );
    }

    const item = items.find((i) => i.id === itemId);
    if (!item) {
      throw new AppError('NOT_FOUND', 'Item not found.');
    }

    // Deduplicate: check if an existing pending request from this org for this item exists
    const existingReq = donationRequests.find(
      (r) => r.itemId === itemId && r.orgId === org.id,
    );
    if (existingReq) {
      return existingReq;
    }

    const newRequest: DonationRequest = {
      id: `req-${Date.now()}`,
      itemId,
      orgId: org.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    useMockDataStore.getState().addDonationRequest(newRequest);

    // Auto-create/find conversation between NGO requester and donor
    let conv = conversations.find(
      (c) =>
        c.itemId === itemId &&
        ((c.buyerId === currentPersonaId && c.sellerId === item.ownerId) ||
          (c.buyerId === item.ownerId && c.sellerId === currentPersonaId)),
    );

    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        itemId,
        buyerId: currentPersonaId,
        sellerId: item.ownerId,
      };
      useMockDataStore.getState().addConversation(conv);
    }

    // Add intro and system message to conversation so it immediately appears in both inboxes
    useMockDataStore.getState().addMessage({
      id: `msg-${Date.now()}-intro`,
      conversationId: conv.id,
      senderId: currentPersonaId,
      kind: 'text',
      body: `Hello! We would love to receive "${item.title}" for our community programs at ${org.name}.`,
      createdAt: new Date().toISOString(),
    });

    useMockDataStore.getState().addMessage({
      id: `msg-${Date.now()}-sys`,
      conversationId: conv.id,
      senderId: currentPersonaId,
      kind: 'system',
      body: `Donation request submitted by ${org.name} (${org.verified ? 'Verified NGO' : 'Pending Verification'}).`,
      createdAt: new Date(Date.now() + 500).toISOString(),
    });

    return newRequest;
  },

  async listRequestsForItem(itemId: string): Promise<DonationRequest[]> {
    await simulateLatency();

    const seenOrgs = new Set<string>();
    return useMockDataStore
      .getState()
      .donationRequests.filter((r) => {
        if (r.itemId !== itemId) return false;
        if (seenOrgs.has(r.orgId)) return false;
        seenOrgs.add(r.orgId);
        return true;
      });
  },

  async respond(requestId: string, accept: boolean): Promise<DonationRequest> {
    await simulateLatency(350);

    const { donationRequests, items, conversations, profiles, organizations } =
      useMockDataStore.getState();
    const req = donationRequests.find((r) => r.id === requestId);
    if (!req) {
      throw new AppError('NOT_FOUND', 'Donation request not found.');
    }

    const item = items.find((i) => i.id === req.itemId);
    const org = organizations.find((o) => o.id === req.orgId);
    const donor = item ? profiles.find((p) => p.id === item.ownerId) : null;
    const donorName = donor?.displayName ?? 'Donor';

    // Find conversation to append update
    const conv = conversations.find(
      (c) =>
        c.itemId === req.itemId &&
        (org ? c.buyerId === org.ownerId || c.sellerId === org.ownerId : true),
    );

    if (accept) {
      // 1. Accept this request
      useMockDataStore.getState().updateDonationRequest(requestId, { status: 'accepted' });

      // 2. Mark item as completed and set claimedByOrgId
      useMockDataStore
        .getState()
        .updateItem(req.itemId, { status: 'completed', claimedByOrgId: req.orgId });

      // 3. Increment NGO itemsReceived count
      useMockDataStore.getState().incrementOrgReceived(req.orgId);

      // 4. Decline other pending requests on the same item
      donationRequests
        .filter((r) => r.itemId === req.itemId && r.id !== requestId && r.status === 'pending')
        .forEach((otherReq) => {
          useMockDataStore.getState().updateDonationRequest(otherReq.id, { status: 'declined' });
        });

      if (conv) {
        useMockDataStore.getState().addMessage({
          id: `msg-${Date.now()}-accept`,
          conversationId: conv.id,
          senderId: item?.ownerId ?? 'system',
          kind: 'system',
          body: `Donation request accepted by ${donorName}! Item marked completed.`,
          createdAt: new Date().toISOString(),
        });
      }

      return { ...req, status: 'accepted' };
    } else {
      useMockDataStore.getState().updateDonationRequest(requestId, { status: 'declined' });

      if (conv) {
        useMockDataStore.getState().addMessage({
          id: `msg-${Date.now()}-decline`,
          conversationId: conv.id,
          senderId: item?.ownerId ?? 'system',
          kind: 'system',
          body: `Donation request declined by ${donorName}.`,
          createdAt: new Date().toISOString(),
        });
      }

      return { ...req, status: 'declined' };
    }
  },
};
