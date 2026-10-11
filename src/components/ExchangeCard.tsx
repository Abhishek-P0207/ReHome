/**
 * ExchangeCard — shows swap proposal with both items, computed result, and actions.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, spacing, radius } from '@/theme/tokens';
import { PriceText, formatINR } from './PriceText';
import { StatusChip } from './StatusChip';
import { Button } from './Button';

interface SwapItem {
  title: string;
  category: string;
  value: number;
}

interface Props {
  itemA: SwapItem;
  itemB: SwapItem;
  even: boolean;
  topupAmount: number;
  topupPayerName: string;
  status: 'pending' | 'accepted' | 'declined';
  canRespond: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function ExchangeCard({
  itemA,
  itemB,
  even,
  topupAmount,
  topupPayerName,
  status,
  canRespond,
  onAccept,
  onDecline,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="swap-horizontal" size={18} color={colors.exchange} />
        <Text style={styles.title}>Swap Proposal</Text>
      </View>

      <View style={styles.itemsRow}>
        <View style={styles.swapItem}>
          <Text style={styles.itemTitle} numberOfLines={2}>{itemA.title}</Text>
          <PriceText amount={itemA.value} size="sm" />
        </View>
        <MaterialCommunityIcons name="swap-horizontal" size={24} color={colors.exchange} />
        <View style={styles.swapItem}>
          <Text style={styles.itemTitle} numberOfLines={2}>{itemB.title}</Text>
          <PriceText amount={itemB.value} size="sm" />
        </View>
      </View>

      <View style={styles.resultRow}>
        <MaterialCommunityIcons
          name={even ? 'check-circle' : 'cash-plus'}
          size={16}
          color={even ? colors.success : colors.exchange}
        />
        <Text style={[styles.result, { color: even ? colors.success : colors.exchange }]}>
          {even
            ? 'Even swap!'
            : `Top-up ${formatINR(topupAmount)} paid by ${topupPayerName}`}
        </Text>
      </View>

      <Text style={styles.disclaimer}>Payment is settled at handover.</Text>

      <StatusChip status={status === 'accepted' ? 'completed' : status === 'pending' ? 'pending' : 'reserved'} />

      {canRespond && status === 'pending' && (
        <View style={styles.actions}>
          <Button label="Accept" variant="primary" onPress={onAccept ?? (() => {})} style={styles.btn} />
          <Button label="Decline" variant="ghost" onPress={onDecline ?? (() => {})} style={styles.btn} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.exchangeBg,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontFamily: fontFamily.semiBold, fontSize: 14, lineHeight: 20, color: colors.exchange },
  itemsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  swapItem: { flex: 1, gap: spacing.xs },
  itemTitle: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 18, color: colors.textPrimary },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md },
  result: { fontFamily: fontFamily.semiBold, fontSize: 13, lineHeight: 18, flex: 1 },
  disclaimer: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16, color: colors.textSecondary },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  btn: { flex: 1, height: 40 },
});
