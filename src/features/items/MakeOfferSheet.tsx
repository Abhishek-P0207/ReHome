/**
 * Make an Offer Bottom Sheet.
 * Displays asking price, numeric amount input, quick chips (-10%, -20%, asking price),
 * validates amounts (> 0 and <= askingPrice), and triggers onSendOffer.
 */
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheet, Button, PriceText } from '@/components';
import { colors, spacing, fontFamily, radius } from '@/theme/tokens';
import { formatINR } from '@/lib/format';
import { haptic } from '@/lib/haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  askingPrice: number;
  onSendOffer: (amount: number) => Promise<void>;
}

export function MakeOfferSheet({
  visible,
  onClose,
  askingPrice,
  onSendOffer,
}: Props) {
  const [amountStr, setAmountStr] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (visible && askingPrice > 0) {
      // Default to 10% below asking price
      const defaultOffer = Math.round((askingPrice * 0.9) / 50) * 50;
      setAmountStr(String(defaultOffer));
      setError(null);
    }
  }, [visible, askingPrice]);

  const numAmount = parseInt(amountStr, 10);

  const validate = (val: number): string | null => {
    if (isNaN(val) || val <= 0) {
      return 'Offer amount must be greater than ₹0.';
    }
    if (val > askingPrice) {
      return `Offer cannot be above asking price of ${formatINR(askingPrice)}.`;
    }
    return null;
  };

  const handleChipSelect = (pctDiscount: number) => {
    haptic.light();
    let val: number;
    if (pctDiscount === 0) {
      val = askingPrice;
    } else {
      val = Math.round((askingPrice * (1 - pctDiscount)) / 50) * 50;
    }
    setAmountStr(String(val));
    setError(validate(val));
  };

  const handleTextChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '');
    setAmountStr(clean);
    const val = parseInt(clean, 10);
    setError(validate(val));
  };

  const handleSubmit = async () => {
    const err = validate(numAmount);
    if (err) {
      setError(err);
      haptic.warning();
      return;
    }

    try {
      setSubmitting(true);
      haptic.light();
      await onSendOffer(numAmount);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to send offer.');
    } finally {
      setSubmitting(false);
    }
  };

  const isInvalid = !!validate(numAmount) || isNaN(numAmount);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.sheetContent}>
        {/* Title */}
        <View style={styles.header}>
          <Text style={styles.title}>Make an Offer</Text>
          <View style={styles.askingRow}>
            <Text style={styles.askingLabel}>Asking Price:</Text>
            <PriceText amount={askingPrice} size="md" />
          </View>
        </View>

        {/* Quick Suggestion Chips */}
        <View style={styles.chipsSection}>
          <Text style={styles.sectionLabel}>QUICK OFFERS</Text>
          <View style={styles.chipsRow}>
            <Pressable
              onPress={() => handleChipSelect(0.1)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>-10% ({formatINR(Math.round((askingPrice * 0.9) / 50) * 50)})</Text>
            </Pressable>
            <Pressable
              onPress={() => handleChipSelect(0.2)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>-20% ({formatINR(Math.round((askingPrice * 0.8) / 50) * 50)})</Text>
            </Pressable>
            <Pressable
              onPress={() => handleChipSelect(0)}
              style={styles.chip}
            >
              <Text style={styles.chipText}>Full Price</Text>
            </Pressable>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.rupeePrefix}>₹</Text>
          <TextInput
            style={styles.input}
            value={amountStr}
            onChangeText={handleTextChange}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
        </View>

        {/* Validation Error Message */}
        {error && (
          <View style={styles.errorBox}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Action Button */}
        <Button
          label="Send offer"
          onPress={handleSubmit}
          variant="primary"
          disabled={isInvalid || submitting}
          loading={submitting}
          fullWidth
          style={{ marginTop: spacing.sm }}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  askingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  askingLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  chipsSection: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.chip,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.primaryDark,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    height: 56,
  },
  rupeePrefix: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: colors.textPrimary,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dangerBg,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.danger,
    flex: 1,
  },
});
