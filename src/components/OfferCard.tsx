/**
 * OfferCard — shows an offer amount, status, and accept/decline actions.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, spacing, radius } from '@/theme/tokens';
import { PriceText } from './PriceText';
import { StatusChip } from './StatusChip';
import { Button } from './Button';

interface Props {
  amount: number;
  status: 'pending' | 'accepted' | 'declined';
  isOwn: boolean;
  canRespond: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function OfferCard({
  amount,
  status,
  isOwn,
  canRespond,
  onAccept,
  onDecline,
}: Props) {
  return (
    <View style={[styles.card, isOwn && styles.cardOwn]}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="tag-outline"
          size={18}
          color={colors.exchange}
        />
        <Text style={styles.title}>
          {isOwn ? 'Your offer' : 'Offer received'}
        </Text>
      </View>
      <PriceText amount={amount} size="lg" />
      <StatusChip
        status={status === 'accepted' ? 'completed' : status === 'pending' ? 'pending' : 'reserved'}
      />
      {canRespond && status === 'pending' && (
        <View style={styles.actions}>
          <Button
            label="Accept"
            size="sm"
            variant="primary"
            onPress={onAccept ?? (() => {})}
            style={styles.actionBtn}
          />
          <Button
            label="Decline"
            size="sm"
            variant="ghost"
            onPress={onDecline ?? (() => {})}
            style={styles.actionBtn}
          />
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
    alignSelf: 'flex-start',
    maxWidth: '85%',
  },
  cardOwn: {
    alignSelf: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
    color: colors.exchange,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 40,
  },
});
