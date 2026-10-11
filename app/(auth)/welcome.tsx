/**
 * Welcome Screen.
 * Brand mark, tagline, geometric illustration using simple shapes & icons,
 * Log In and Create Account buttons.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { haptic } from '@/lib/haptics';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleCreateAccount = () => {
    haptic.light();
    router.push('/(auth)/signup');
  };

  const handleLogIn = () => {
    haptic.light();
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <MaterialCommunityIcons name="home-heart" size={28} color={colors.primary} />
          </View>
          <Text style={styles.brandName}>ReHome</Text>
        </View>

        {/* Soft Geometric Illustration (Pure shapes & icons, no remote images) */}
        <View style={styles.illustrationArea}>
          <View style={[styles.shapeCircle, styles.circleBig]} />
          <View style={[styles.shapeCircle, styles.circleSell]}>
            <MaterialCommunityIcons name="tag-outline" size={28} color={colors.sell} />
            <Text style={[styles.shapeLabel, { color: colors.sell }]}>Sell</Text>
          </View>
          <View style={[styles.shapeCircle, styles.circleExchange]}>
            <MaterialCommunityIcons name="swap-horizontal" size={28} color={colors.exchange} />
            <Text style={[styles.shapeLabel, { color: colors.exchange }]}>Swap</Text>
          </View>
          <View style={[styles.shapeCircle, styles.circleDonate]}>
            <MaterialCommunityIcons name="hand-heart-outline" size={28} color={colors.donate} />
            <Text style={[styles.shapeLabel, { color: colors.donate }]}>Donate</Text>
          </View>
        </View>

        {/* Value Statement */}
        <View style={styles.copyArea}>
          <Text style={styles.headline}>Give your stuff a second life.</Text>
          <Text style={styles.subtext}>
            Sell gently used goods, swap items with neighbors, or donate directly to verified local NGOs.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            label="Create account"
            onPress={handleCreateAccount}
            variant="primary"
            fullWidth
          />
          <Button
            label="Log in"
            onPress={handleLogIn}
            variant="ghost"
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
    paddingVertical: spacing.lg,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.card,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  illustrationArea: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shapeCircle: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    ...shadow.soft,
  },
  circleBig: {
    width: 190,
    height: 190,
    backgroundColor: colors.primarySoft,
    opacity: 0.5,
  },
  circleSell: {
    width: 88,
    height: 88,
    backgroundColor: colors.surface,
    left: '12%',
    top: 40,
    gap: 2,
  },
  circleExchange: {
    width: 96,
    height: 96,
    backgroundColor: colors.surface,
    right: '10%',
    top: 25,
    gap: 2,
  },
  circleDonate: {
    width: 92,
    height: 92,
    backgroundColor: colors.surface,
    bottom: 15,
    alignSelf: 'center',
    gap: 2,
  },
  shapeLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
  },
  copyArea: {
    gap: spacing.sm,
  },
  headline: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.textPrimary,
  },
  subtext: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  actions: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
