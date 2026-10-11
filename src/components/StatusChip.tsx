/**
 * StatusChip — small colored chip for item status.
 * Variants: Reserved, Completed, Pending, Verified.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fontFamily, spacing, radius } from '@/theme/tokens';

type Status = 'active' | 'reserved' | 'completed' | 'pending' | 'verified' | 'declined';

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
  active: { bg: colors.sellBg, text: colors.primaryDark, label: 'Active' },
  reserved: { bg: colors.exchangeBg, text: colors.exchange, label: 'Reserved' },
  completed: { bg: colors.sellBg, text: colors.success, label: 'Completed' },
  pending: { bg: colors.exchangeBg, text: colors.exchange, label: 'Pending' },
  verified: { bg: colors.sellBg, text: colors.success, label: 'Verified' },
  declined: { bg: colors.dangerBg, text: colors.danger, label: 'Declined' },
};

interface Props {
  status: Status;
}

export function StatusChip({ status }: Props) {
  const config =
    statusConfig[status] ?? {
      bg: colors.exchangeBg,
      text: colors.exchange,
      label: typeof status === 'string' ? status.toUpperCase() : 'Pending',
    };
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
