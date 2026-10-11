/**
 * StatusChip — small colored chip for item status.
 * Variants: Reserved, Completed, Pending, Verified.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fontFamily, spacing, radius } from '@/theme/tokens';

type Status = 'reserved' | 'completed' | 'pending' | 'verified';

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  reserved: { bg: colors.exchangeBg, text: colors.exchange, label: 'Reserved' },
  completed: { bg: colors.sellBg, text: colors.success, label: 'Completed' },
  pending: { bg: colors.exchangeBg, text: colors.exchange, label: 'Pending' },
  verified: { bg: colors.sellBg, text: colors.success, label: 'Verified' },
};

interface Props {
  status: Status;
}

export function StatusChip({ status }: Props) {
  const config = statusConfig[status];
  return (
    <View style={[styles.chip, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
