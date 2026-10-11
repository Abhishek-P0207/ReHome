/**
 * ConfidenceBadge — shows AI confidence level.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, spacing, radius } from '@/theme/tokens';
import type { Confidence } from '@/types';

const confidenceConfig: Record<Confidence, { icon: string; color: string; label: string }> = {
  high: { icon: 'shield-check', color: colors.success, label: 'High confidence' },
  medium: { icon: 'shield-half-full', color: colors.exchange, label: 'Medium confidence' },
  low: { icon: 'shield-alert', color: colors.danger, label: 'Low confidence' },
};

interface Props {
  confidence: Confidence;
  compact?: boolean;
}

export function ConfidenceBadge({ confidence, compact = false }: Props) {
  const config = confidenceConfig[confidence];
  return (
    <View style={styles.badge} accessibilityLabel={config.label}>
      <MaterialCommunityIcons
        name={config.icon as any}
        size={compact ? 14 : 16}
        color={config.color}
      />
      {!compact && (
        <Text style={[styles.label, { color: config.color }]}>
          {config.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});
