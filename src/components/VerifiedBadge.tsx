/**
 * VerifiedBadge — green verified checkmark for NGOs.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, spacing, radius } from '@/theme/tokens';

interface Props {
  pending?: boolean;
}

export function VerifiedBadge({ pending = false }: Props) {
  if (pending) {
    return (
      <View style={[styles.badge, styles.pendingBadge]}>
        <MaterialCommunityIcons name="clock-outline" size={14} color={colors.exchange} />
        <Text style={[styles.label, { color: colors.exchange }]}>Pending verification</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.verifiedBadge]}>
      <MaterialCommunityIcons name="check-decagram" size={14} color={colors.success} />
      <Text style={[styles.label, { color: colors.success }]}>Verified NGO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    alignSelf: 'flex-start',
  },
  verifiedBadge: { backgroundColor: '#E8F5E9' },
  pendingBadge: { backgroundColor: colors.exchangeBg },
  label: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
});
