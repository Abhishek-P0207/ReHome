/**
 * ErrorState — error message with retry button.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, fontFamily, spacing } from '@/theme/tokens';
import { Button } from './Button';

interface Props {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="alert-circle-outline" size={56} color={colors.danger} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button label="Retry" onPress={onRetry} variant="secondary" style={styles.btn} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  message: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  btn: { marginTop: spacing.sm },
});
