/**
 * Mock Items Service Implementation.
 */
import type { ItemsService, ListItemsFilter, CreateItemDraft } from '@/services/types';
import type { Item } from '@/types';
import { AppError } from '@/types';
import { useDemoStore } from '@/store/demoStore';
import { useMockDataStore } from '@/store/mockDataStore';
import { simulateLatency } from './utils';

export const mockItemsService: ItemsService = {
  async list(filter?: ListItemsFilter): Promise<Item[]> {
    await simulateLatency();

    let items = useMockDataStore.getState().items;

    if (filter?.type) {
      items = items.filter((item) => item.listingType === filter.type);
    }

    if (filter?.city) {
      items = items.filter(
        (item) => item.city.toLowerCase() === filter.city?.toLowerCase(),
      );
    }

    if (filter?.query && filter.query.trim().length > 0) {
      const q = filter.query.trim().toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q),
      );
    }

    return items;
  },

  async get(id: string): Promise<Item> {
    await simulateLatency();

    const item = useMockDataStore.getState().items.find((it) => it.id === id);
    if (!item) {
      throw new AppError('NOT_FOUND', `Item with ID ${id} not found.`);
    }
    return item;
  },

  async create(draft: CreateItemDraft): Promise<Item> {
    await simulateLatency();

    const { currentPersonaId } = useDemoStore.getState();
    const newItem: Item = {
      ...draft,
      id: `item-${Date.now()}`,
      ownerId: currentPersonaId,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    useMockDataStore.getState().addItem(newItem);
    return newItem;
  },

  async listMine(): Promise<Item[]> {
    await simulateLatency();

    const { currentPersonaId } = useDemoStore.getState();
    return useMockDataStore
      .getState()
      .items.filter((item) => item.ownerId === currentPersonaId);
  },

  async markCompleted(id: string): Promise<Item> {
    await simulateLatency();

    const item = useMockDataStore.getState().items.find((it) => it.id === id);
    if (!item) {
      throw new AppError('NOT_FOUND', `Item with ID ${id} not found.`);
    }

    useMockDataStore.getState().updateItem(id, { status: 'completed' });
    return { ...item, status: 'completed' };
  },

  async remove(id: string): Promise<void> {
    await simulateLatency();

    const item = useMockDataStore.getState().items.find((it) => it.id === id);
    if (!item) {
      throw new AppError('NOT_FOUND', `Item with ID ${id} not found.`);
    }

    useMockDataStore.getState().removeItem(id);
  },
};
