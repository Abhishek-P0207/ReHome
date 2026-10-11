/**
 * NgoCard — card showing NGO name, city, description, verified status, items received.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fontFamily, spacing, radius, shadow } from '@/theme/tokens';
import { PressableScale } from './PressableScale';
import { VerifiedBadge } from './VerifiedBadge';
import type { Organization } from '@/types';

interface Props {
  org: Organization;
  onPress: () => void;
}

export function NgoCard({ org, onPress }: Props) {
  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`${org.name}, ${org.verified ? 'Verified' : 'Pending'} NGO`}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>{org.name}</Text>
          <VerifiedBadge pending={!org.verified} />
        </View>
        <Text style={styles.city}>{org.city}</Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>{org.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.stat}>
          <Text style={styles.statNum}>{org.itemsReceived}</Text> items received
        </Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
    ...shadow.soft,
  },
  header: { gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  name: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 22, color: colors.textPrimary, flex: 1 },
  city: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  description: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20, color: colors.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center' },
  stat: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, color: colors.textSecondary },
  statNum: { fontFamily: fontFamily.semiBold, color: colors.textPrimary },
});
