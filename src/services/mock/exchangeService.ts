/**
 * Mock Exchange Service Implementation.
 * Uses lib/exchange.ts for mathematical fairness calculation.
 */
import type { ExchangeService, ProposeExchangeParams } from '@/services/types';
import type { Message } from '@/types';
import { AppError } from '@/types';
import { calculateExchange } from '@/lib/exchange';
import { useDemoStore } from '@/store/demoStore';
import { useMockDataStore } from '@/store/mockDataStore';
import { simulateLatency } from './utils';

export const mockExchangeService: ExchangeService = {
  async propose(params: ProposeExchangeParams): Promise<Message> {
    await simulateLatency(350);

    const { currentPersonaId, autoRespond } = useDemoStore.getState();
    const { items, conversations } = useMockDataStore.getState();

    const conv = conversations.find((c) => c.id === params.conversationId);
    if (!conv) {
      throw new AppError('NOT_FOUND', 'Conversation not found.');
    }

    const myItem = items.find((i) => i.id === params.myItemId);
    const theirItem = items.find((i) => i.id === params.theirItemId);

    if (!myItem || !theirItem) {
      throw new AppError('NOT_FOUND', 'One of the items to exchange was not found.');
    }

    const otherPersonId = conv.sellerId === currentPersonaId ? conv.buyerId : conv.sellerId;

    const outcome = calculateExchange({
      itemA: myItem,
      itemB: theirItem,
      ownerAId: currentPersonaId,
      ownerBId: otherPersonId,
    });

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: params.conversationId,
      senderId: currentPersonaId,
      kind: 'exchange',
      offeredItemId: params.myItemId,
      topupAmount: outcome.even ? 0 : outcome.topupAmount,
      topupPayerId: outcome.even ? undefined : (outcome.payerId ?? undefined),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    useMockDataStore.getState().addMessage(newMsg);

    // Auto-respond for swap if enabled
    if (autoRespond) {
      setTimeout(() => {
        useMockDataStore.getState().updateMessage(newMsg.id, { status: 'accepted' });
        useMockDataStore.getState().updateItem(myItem.id, { status: 'reserved' });
        useMockDataStore.getState().updateItem(theirItem.id, { status: 'reserved' });
        const sysMsg: Message = {
          id: `msg-${Date.now()}-swap-sys`,
          conversationId: params.conversationId,
          senderId: otherPersonId,
          kind: 'system',
          body: 'Swap proposal accepted! Both items are now reserved.',
          createdAt: new Date().toISOString(),
        };
        useMockDataStore.getState().addMessage(sysMsg);
      }, 3000);
    }

    return newMsg;
  },

  async respond(messageId: string, conversationId: string, accept: boolean): Promise<Message> {
    await simulateLatency(300);

    const { messages, items, conversations } = useMockDataStore.getState();
    const msg = messages.find((m) => m.id === messageId);
    if (!msg) {
      throw new AppError('NOT_FOUND', 'Message not found.');
    }

    const conv = conversations.find((c) => c.id === conversationId);
    const newStatus: 'accepted' | 'declined' = accept ? 'accepted' : 'declined';

    useMockDataStore.getState().updateMessage(messageId, { status: newStatus });

    if (accept && conv && msg.offeredItemId) {
      // Mark both items as reserved
      useMockDataStore.getState().updateItem(conv.itemId, { status: 'reserved' });
      useMockDataStore.getState().updateItem(msg.offeredItemId, { status: 'reserved' });

      const sysMsg: Message = {
        id: `msg-${Date.now()}-sys`,
        conversationId,
        senderId: conv.sellerId,
        kind: 'system',
        body: 'Swap proposal accepted! Both items are now reserved.',
        createdAt: new Date().toISOString(),
      };
      useMockDataStore.getState().addMessage(sysMsg);
    }

    return { ...msg, status: newStatus };
  },
};
