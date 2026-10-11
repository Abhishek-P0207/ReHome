import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components';
import { colors, spacing, fontFamily } from '@/theme/tokens';

export default function IndexScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Phase F0 Scaffold</Text>
        </View>
        <Text style={styles.title}>ReHome</Text>
        <Text style={styles.subtitle}>
          Give your stuff a second life. Sell, swap, or donate household items.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Design System Gallery</Text>
          <Text style={styles.cardDesc}>
            Review all 22 custom UI components, tokens, typography, and states built for ReHome.
          </Text>
          <Button
            label="Open Design System"
            onPress={() => router.push('/design-system')}
            variant="primary"
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.primaryDark,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 32,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  cardDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
