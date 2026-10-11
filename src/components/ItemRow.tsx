/**
 * ItemRow — list version of item card for My Items, etc.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fontFamily, spacing, radius, shadow } from '@/theme/tokens';
import { PressableScale } from './PressableScale';
import { ItemImage } from './ItemImage';
import { TypeTag } from './TypeTag';
import { StatusChip } from './StatusChip';
import { PriceText } from './PriceText';
import type { Item } from '@/types';

interface Props {
  item: Item;
  onPress: () => void;
  actions?: React.ReactNode;
}

export function ItemRow({ item, onPress, actions }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`${item.title}, ${item.listingType}`}
      style={styles.card}
    >
      <ItemImage
        category={item.category}
        style={styles.image}
        size={80}
        aspectRatio={1}
      />
      <View style={styles.info}>
        <View style={styles.topRow}>
          <TypeTag type={item.listingType} small />
          {item.status !== 'active' && (
            <StatusChip
              status={item.status === 'reserved' ? 'reserved' : 'completed'}
            />
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.bottomRow}>
          {item.price != null && <PriceText amount={item.price} size="sm" />}
          {item.listingType === 'donate' && (
            <Text style={styles.free}>Free</Text>
          )}
          <Text style={styles.city}>{item.city}</Text>
        </View>
        {actions && <View style={styles.actions}>{actions}</View>}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadow.soft,
    padding: spacing.md,
    gap: spacing.md,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  city: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  free: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.donate,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
