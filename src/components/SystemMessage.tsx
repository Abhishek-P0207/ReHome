/**
 * SystemMessage — centered muted system messages in chat (e.g. "Offer accepted").
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fontFamily, spacing } from '@/theme/tokens';

interface Props {
  body: string;
}

export function SystemMessage({ body }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  text: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
