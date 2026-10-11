/**
 * Mock Chat Service Implementation.
 * Implements offer simulations, auto-counters, deal completion, and message subscriptions.
 */
import type {
  ChatService,
  SendOfferParams,
  RespondOfferParams,
} from '@/services/types';
import type { Conversation, Message } from '@/types';
import { AppError } from '@/types';
import { useDemoStore } from '@/store/demoStore';
import { useMockDataStore } from '@/store/mockDataStore';
import { simulateLatency } from './utils';

type MessageListener = (msg: Message) => void;
const listeners: Map<string, Set<MessageListener>> = new Map();

function emitMessage(conversationId: string, msg: Message) {
  const set = listeners.get(conversationId);
  if (set) {
    set.forEach((cb) => cb(msg));
  }
}

export const mockChatService: ChatService = {
  async listConversations(): Promise<Conversation[]> {
    await simulateLatency();

    const { currentPersonaId } = useDemoStore.getState();
    const { conversations } = useMockDataStore.getState();

    return conversations.filter(
      (c) => c.buyerId === currentPersonaId || c.sellerId === currentPersonaId,
    );
  },

  async getOrCreateConversation(itemId: string): Promise<Conversation> {
    await simulateLatency();

    const { currentPersonaId } = useDemoStore.getState();
    const { items, conversations } = useMockDataStore.getState();

    const item = items.find((i) => i.id === itemId);
    if (!item) {
      throw new AppError('NOT_FOUND', `Item ${itemId} not found.`);
    }

    const existing = conversations.find(
      (c) =>
        c.itemId === itemId &&
        (c.buyerId === currentPersonaId || c.sellerId === currentPersonaId),
    );

    if (existing) {
      return existing;
    }

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      itemId,
      buyerId: currentPersonaId,
      sellerId: item.ownerId,
    };

    useMockDataStore.getState().addConversation(newConv);
    return newConv;
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    await simulateLatency();

    const { messages } = useMockDataStore.getState();
    return messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  async sendText(conversationId: string, text: string): Promise<Message> {
    await simulateLatency(250);

    const { currentPersonaId } = useDemoStore.getState();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: currentPersonaId,
      kind: 'text',
      body: text,
      createdAt: new Date().toISOString(),
    };

    useMockDataStore.getState().addMessage(newMsg);
    emitMessage(conversationId, newMsg);
    return newMsg;
  },

  async sendOffer(params: SendOfferParams): Promise<Message> {
    await simulateLatency(300);

    const { currentPersonaId, autoRespond } = useDemoStore.getState();
    const { conversations, items } = useMockDataStore.getState();

    const conv = conversations.find((c) => c.id === params.conversationId);
    if (!conv) {
      throw new AppError('NOT_FOUND', 'Conversation not found.');
    }

    const item = items.find((i) => i.id === conv.itemId);
    const askingPrice = item?.price ?? 1000;

    const offerMsg: Message = {
      id: `msg-${Date.now()}`,
      conversationId: params.conversationId,
      senderId: currentPersonaId,
      kind: 'offer',
      amount: params.amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    useMockDataStore.getState().addMessage(offerMsg);
    emitMessage(params.conversationId, offerMsg);

    // Mock seller auto-response if enabled
    if (autoRespond) {
      const sellerId = conv.sellerId === currentPersonaId ? conv.buyerId : conv.sellerId;
      setTimeout(() => {
        const ratio = params.amount / askingPrice;

        if (ratio >= 0.9) {
          // Accept offer
          useMockDataStore.getState().updateMessage(offerMsg.id, { status: 'accepted' });
          if (item) {
            useMockDataStore.getState().updateItem(item.id, { status: 'reserved' });
          }
          const sysMsg: Message = {
            id: `msg-${Date.now()}-sys`,
            conversationId: params.conversationId,
            senderId: sellerId,
            kind: 'system',
            body: 'Offer accepted. This item is now reserved.',
            createdAt: new Date().toISOString(),
          };
          useMockDataStore.getState().addMessage(sysMsg);
          emitMessage(params.conversationId, sysMsg);
        } else if (ratio >= 0.7) {
          // Counter with 95% of asking price, rounded to nearest 50
          const counterPrice = Math.round((askingPrice * 0.95) / 50) * 50;
          const counterMsg: Message = {
            id: `msg-${Date.now()}-counter`,
            conversationId: params.conversationId,
            senderId: sellerId,
            kind: 'offer',
            amount: counterPrice,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
          useMockDataStore.getState().addMessage(counterMsg);
          emitMessage(params.conversationId, counterMsg);
        } else {
          // Decline with polite text
          useMockDataStore.getState().updateMessage(offerMsg.id, { status: 'declined' });
          const declineMsg: Message = {
            id: `msg-${Date.now()}-decline`,
            conversationId: params.conversationId,
            senderId: sellerId,
            kind: 'text',
            body: 'Thank you for your offer, but this is a bit too low for this item.',
            createdAt: new Date().toISOString(),
          };
          useMockDataStore.getState().addMessage(declineMsg);
          emitMessage(params.conversationId, declineMsg);
        }
      }, 3000);
    }

    return offerMsg;
  },

  async respondToOffer(params: RespondOfferParams): Promise<Message> {
    await simulateLatency(300);

    const { messages, items, conversations } = useMockDataStore.getState();
    const msg = messages.find((m) => m.id === params.messageId);
    if (!msg) {
      throw new AppError('NOT_FOUND', 'Message not found.');
    }

    const conv = conversations.find((c) => c.id === params.conversationId);
    const newStatus: 'accepted' | 'declined' = params.accept ? 'accepted' : 'declined';

    useMockDataStore.getState().updateMessage(params.messageId, { status: newStatus });

    if (params.accept && conv) {
      useMockDataStore.getState().updateItem(conv.itemId, { status: 'reserved' });
      const sysMsg: Message = {
        id: `msg-${Date.now()}-sys`,
        conversationId: params.conversationId,
        senderId: conv.sellerId,
        kind: 'system',
        body: 'Offer accepted. This item is now reserved.',
        createdAt: new Date().toISOString(),
      };
      useMockDataStore.getState().addMessage(sysMsg);
      emitMessage(params.conversationId, sysMsg);
    }

    const updated = { ...msg, status: newStatus };
    emitMessage(params.conversationId, updated);
    return updated;
  },

  async markCompleted(conversationId: string): Promise<void> {
    await simulateLatency(300);

    const { conversations, items } = useMockDataStore.getState();
    const conv = conversations.find((c) => c.id === conversationId);
    if (conv) {
      useMockDataStore.getState().updateItem(conv.itemId, { status: 'completed' });
      const sysMsg: Message = {
        id: `msg-${Date.now()}-complete`,
        conversationId,
        senderId: conv.sellerId,
        kind: 'system',
        body: 'Deal marked completed.',
        createdAt: new Date().toISOString(),
      };
      useMockDataStore.getState().addMessage(sysMsg);
      emitMessage(conversationId, sysMsg);
    }
  },

  subscribe(conversationId: string, cb: MessageListener): () => void {
    if (!listeners.has(conversationId)) {
      listeners.set(conversationId, new Set());
    }
    listeners.get(conversationId)!.add(cb);

    return () => {
      listeners.get(conversationId)?.delete(cb);
    };
  },
};
