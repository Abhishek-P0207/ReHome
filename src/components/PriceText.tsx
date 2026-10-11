/**
 * PriceText — formats prices in ₹ with en-IN locale grouping.
 */
import React from 'react';
import { Text, type TextStyle, StyleSheet } from 'react-native';
import { colors, fontFamily } from '@/theme/tokens';

interface Props {
  amount: number;
  style?: TextStyle;
  size?: 'sm' | 'md' | 'lg';
}

const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export { formatINR };

export function PriceText({ amount, style, size = 'md' }: Props) {
  const sizeStyle = sizeStyles[size];
  return (
    <Text
      style={[styles.base, sizeStyle, style]}
      accessibilityLabel={`${formatINR(amount)}`}
    >
      {formatINR(amount)}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: fontFamily.bold,
    color: colors.textPrimary,
  },
});

const sizeStyles = StyleSheet.create({
  sm: { fontSize: 13, lineHeight: 18 },
  md: { fontSize: 16, lineHeight: 22 },
  lg: { fontSize: 22, lineHeight: 28 },
});
