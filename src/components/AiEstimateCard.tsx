/**
 * AiEstimateCard — displays the AI price estimate with confidence.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, spacing, radius, shadow } from '@/theme/tokens';
import { ConfidenceBadge } from './ConfidenceBadge';
import { formatINR } from './PriceText';
import type { AiEstimate } from '@/types';

interface Props {
  estimate: AiEstimate;
}

export function AiEstimateCard({ estimate }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="robot-outline"
          size={20}
          color={colors.primary}
        />
        <Text style={styles.title}>AI Estimate</Text>
        <ConfidenceBadge confidence={estimate.confidence} />
      </View>
      <Text style={styles.range}>
        {formatINR(estimate.min)} – {formatINR(estimate.max)}
      </Text>
      {estimate.brand && (
        <Text style={styles.brand}>
          {estimate.brand}
          {estimate.model ? ` ${estimate.model}` : ''}
        </Text>
      )}
      <Text style={styles.reasoning}>{estimate.reasoning}</Text>
      <View style={styles.disclaimer}>
        <MaterialCommunityIcons
          name="information-outline"
          size={14}
          color={colors.textSecondary}
        />
        <Text style={styles.disclaimerText}>
          An estimate, not a guaranteed price
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: colors.primaryDark,
    flex: 1,
  },
  range: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.primaryDark,
  },
  brand: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  reasoning: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  disclaimerText: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },
});
