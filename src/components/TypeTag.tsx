/**
 * TypeTag — colored chip showing Sell, Exchange, or Donate.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { listingTypeColors, fontFamily, spacing, radius } from '@/theme/tokens';
import type { ListingType } from '@/types';

const labelMap: Record<ListingType, string> = {
  sell: 'Sell',
  exchange: 'Exchange',
  donate: 'Donate',
};

interface Props {
  type: ListingType;
  small?: boolean;
}

export function TypeTag({ type, small = false }: Props) {
  const c = listingTypeColors[type];
  return (
    <View
      style={[
        styles.tag,
        { backgroundColor: c.bg },
        small && styles.small,
      ]}
      accessibilityLabel={`${labelMap[type]} listing`}
    >
      <Text
        style={[
          styles.label,
          { color: c.text },
          small && styles.smallLabel,
        ]}
      >
        {labelMap[type]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  smallLabel: {
    fontSize: 10,
    lineHeight: 14,
  },
});
