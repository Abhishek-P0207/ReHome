/**
 * ItemCard — grid card with photo (4:5 ratio), type tag overlay, title, price, city.
 * Used in the Home feed two-column grid.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, fontFamily, spacing, radius, shadow, animation } from '@/theme/tokens';
import { PressableScale } from './PressableScale';
import { ItemImage } from './ItemImage';
import { TypeTag } from './TypeTag';
import { PriceText } from './PriceText';
import type { Item } from '@/types';

interface Props {
  item: Item;
  index: number;
  onPress: () => void;
}

function getPriceLabel(item: Item): React.ReactNode {
  if (item.listingType === 'donate') {
    return <Text style={styles.freeLabel}>Free</Text>;
  }
  if (item.listingType === 'exchange') {
    return <Text style={styles.swapLabel}>Open to swap</Text>;
  }
  if (item.price != null) {
    return <PriceText amount={item.price} size="sm" />;
  }
  return null;
}

export function ItemCard({ item, index, onPress }: Props) {
  const staggerIndex = Math.min(index, animation.maxStaggerItems);

  return (
    <Animated.View
      entering={FadeInDown.delay(staggerIndex * animation.staggerDelay).springify()}
      style={styles.wrapper}
    >
      <PressableScale
        onPress={onPress}
        accessibilityLabel={`${item.title}, ${item.listingType}`}
        style={styles.card}
      >
        <View style={styles.imageWrapper}>
          <ItemImage category={item.category} aspectRatio={4 / 5} />
          <View style={styles.tagOverlay}>
            <TypeTag type={item.listingType} small />
          </View>
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.bottomRow}>
            {getPriceLabel(item)}
            <Text style={styles.city} numberOfLines={1}>
              {item.city}
            </Text>
          </View>
        </View>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '50%',
    padding: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadow.soft,
  },
  imageWrapper: {
    position: 'relative',
  },
  tagOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  info: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  city: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  freeLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.donate,
  },
  swapLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.exchange,
  },
});
