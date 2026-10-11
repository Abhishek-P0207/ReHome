/**
 * Log In Screen.
 * Accepts email/password, provides quick-persona switcher chips (Ravi, Asha, Priya),
 * and navigates to main tab feed.
 */
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { useAuth } from '@/features/auth/useAuth';
import { haptic } from '@/lib/haptics';

export default function LoginScreen() {
  const router = useRouter();
  const { logIn, switchPersona } = useAuth();

  const [email, setEmail] = useState('ravi@rehome.in');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickPersona = async (personaId: string, emailPreset: string) => {
    haptic.light();
    setEmail(emailPreset);
    try {
      setLoading(true);
      setError(null);
      await switchPersona(personaId);
      haptic.success();
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Failed to switch persona');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    haptic.light();
    try {
      setLoading(true);
      setError(null);
      await logIn({ email: email.trim(), password });
      haptic.success();
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityLabel="Go back"
              style={styles.backBtn}
            >
              <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to continue managing your items and deals</Text>
          </View>

          {/* Quick Login Persona Chips */}
          <View style={styles.quickCard}>
            <Text style={styles.quickLabel}>QUICK DEMO PERSONAS</Text>
            <View style={styles.chipsRow}>
              <Pressable
                onPress={() => handleQuickPersona('user-ravi', 'ravi@rehome.in')}
                style={[styles.personaChip, styles.chipRavi]}
              >
                <Text style={styles.chipText}>Ravi (Buyer)</Text>
              </Pressable>
              <Pressable
                onPress={() => handleQuickPersona('user-asha', 'asha@rehome.in')}
                style={[styles.personaChip, styles.chipAsha]}
              >
                <Text style={styles.chipText}>Asha (Seller)</Text>
              </Pressable>
              <Pressable
                onPress={() => handleQuickPersona('user-priya', 'priya@ashakiran.org')}
                style={[styles.personaChip, styles.chipPriya]}
              >
                <Text style={styles.chipText}>Priya (NGO)</Text>
              </Pressable>
            </View>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <MaterialCommunityIcons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(val) => {
                  setEmail(val);
                  setError(null);
                }}
                placeholder="name@example.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
            </View>

            <Button
              label="Log in"
              onPress={handleLogin}
              variant="primary"
              loading={loading}
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </View>

          {/* Sign Up Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/signup')} hitSlop={8}>
              <Text style={styles.linkText}>Create account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 26,
    lineHeight: 32,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  quickCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    gap: spacing.sm,
    ...shadow.soft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickLabel: {
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
  personaChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    backgroundColor: colors.primarySoft,
  },
  chipRavi: {
    backgroundColor: colors.sellBg,
  },
  chipAsha: {
    backgroundColor: colors.exchangeBg,
  },
  chipPriya: {
    backgroundColor: colors.donateBg,
  },
  chipText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 46,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.dangerBg,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.danger,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  footerText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  linkText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
});
