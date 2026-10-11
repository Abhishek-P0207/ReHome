/**
 * Snackbar wrapper — unified toast notification using React Native Paper with design tokens.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { Snackbar as PaperSnackbar, Text } from 'react-native-paper';
import { colors, radius, fontFamily, spacing } from '@/theme/tokens';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  type?: 'default' | 'success' | 'error';
}

export function Snackbar({
  visible,
  onDismiss,
  message,
  actionLabel,
  onAction,
  duration = 3000,
  type = 'default',
}: Props) {
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.danger;
      default:
        return colors.textPrimary;
    }
  };

  return (
    <PaperSnackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={duration}
      action={
        actionLabel
          ? {
              label: actionLabel,
              onPress: onAction ?? onDismiss,
              textColor: colors.primarySoft,
            }
          : undefined
      }
      style={[
        styles.snackbar,
        { backgroundColor: getBackgroundColor() },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </PaperSnackbar>
  );
}

const styles = StyleSheet.create({
  snackbar: {
    borderRadius: radius.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  text: {
    fontFamily: fontFamily.medium,
    color: colors.white,
    fontSize: 14,
    lineHeight: 20,
  },
});
