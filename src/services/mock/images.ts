/**
 * Mock image asset map.
 * When real assets are added to assets/mock/, they can be mapped here by item ID or image filename.
 * Falls back to undefined so ItemImage renders tasteful category placeholders.
 */
import { ImageSourcePropType } from 'react-native';

export const mockImageMap: Record<string, ImageSourcePropType> = {
  // e.g. 'item-1': require('../../../assets/mock/item-1.jpg'),
};

export function getMockImage(idOrKey?: string): ImageSourcePropType | undefined {
  if (!idOrKey) return undefined;
  return mockImageMap[idOrKey];
}
