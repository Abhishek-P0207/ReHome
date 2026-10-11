/**
 * Sign Up Screen.
 * Full Name, Email, Password, City, plus a two-card choice for Individual vs NGO.
 * NGO choice reveals NGO name, registration number, and verification disclaimer.
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

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Chennai');
  const [role, setRole] = useState<'user' | 'ngo'>('user');

  // NGO specific fields
  const [orgName, setOrgName] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (!city.trim()) {
      setError('Please specify your city.');
      return false;
    }
    if (role === 'ngo') {
      if (!orgName.trim()) {
        setError('Please enter your organization name.');
        return false;
      }
      if (!registrationNo.trim()) {
        setError('Please enter your NGO registration number.');
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    haptic.light();

    try {
      setLoading(true);
      setError(null);
      await signUp({
        name: name.trim(),
        email: email.trim(),
        password,
        city: city.trim(),
        role,
        orgName: role === 'ngo' ? orgName.trim() : undefined,
        registrationNo: role === 'ngo' ? registrationNo.trim() : undefined,
      });

      haptic.success();
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err?.message || 'Could not create account. Please try again.');
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
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Join ReHome to buy, swap, or donate items easily</Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={16} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Role Choice Cards */}
          <View style={styles.roleSelection}>
            <Text style={styles.sectionLabel}>CHOOSE ACCOUNT TYPE</Text>
            <View style={styles.roleRow}>
              {/* Individual Card */}
              <Pressable
                onPress={() => {
                  haptic.light();
                  setRole('user');
                  setError(null);
                }}
                style={[styles.roleCard, role === 'user' && styles.roleCardActive]}
              >
                <MaterialCommunityIcons
                  name="account-outline"
                  size={28}
                  color={role === 'user' ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.roleTitle, role === 'user' && styles.roleTitleActive]}>
                  Individual
                </Text>
                <Text style={styles.roleDesc}>Sell, swap, or donate personal goods</Text>
              </Pressable>

              {/* NGO Card */}
              <Pressable
                onPress={() => {
                  haptic.light();
                  setRole('ngo');
                  setError(null);
                }}
                style={[styles.roleCard, role === 'ngo' && styles.roleCardActive]}
              >
                <MaterialCommunityIcons
                  name="hand-heart-outline"
                  size={28}
                  color={role === 'ngo' ? colors.donate : colors.textSecondary}
                />
                <Text style={[styles.roleTitle, role === 'ngo' && styles.roleTitleActive]}>
                  NGO / Trust
                </Text>
                <Text style={styles.roleDesc}>Claim donations for community causes</Text>
              </Pressable>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setError(null);
                }}
                placeholder="e.g. Maya Sundaram"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  setError(null);
                }}
                placeholder="maya@example.com"
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
                onChangeText={(v) => {
                  setPassword(v);
                  setError(null);
                }}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={styles.input}
                value={city}
                onChangeText={(v) => {
                  setCity(v);
                  setError(null);
                }}
                placeholder="e.g. Chennai, Bengaluru"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* NGO Specific Fields */}
            {role === 'ngo' && (
              <View style={styles.ngoSection}>
                <View style={styles.ngoNotice}>
                  <MaterialCommunityIcons
                    name="information-outline"
                    size={18}
                    color={colors.donate}
                  />
                  <Text style={styles.ngoNoticeText}>
                    Verification is required before claiming donations. You can still list items immediately.
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Organization Name</Text>
                  <TextInput
                    style={styles.input}
                    value={orgName}
                    onChangeText={(v) => {
                      setOrgName(v);
                      setError(null);
                    }}
                    placeholder="e.g. Vidya Vikas Trust"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Registration Number</Text>
                  <TextInput
                    style={styles.input}
                    value={registrationNo}
                    onChangeText={(v) => {
                      setRegistrationNo(v);
                      setError(null);
                    }}
                    placeholder="e.g. TN/2023/18293"
                    placeholderTextColor={colors.textSecondary}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            )}

            <Button
              label="Create account"
              onPress={handleSignup}
              variant="primary"
              loading={loading}
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </View>

          {/* Footer Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={8}>
              <Text style={styles.linkText}>Log in</Text>
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
    gap: spacing.lg,
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
  roleSelection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  roleCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  roleTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  roleTitleActive: {
    color: colors.primaryDark,
  },
  roleDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    lineHeight: 15,
    color: colors.textSecondary,
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
  ngoSection: {
    gap: spacing.md,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
  },
  ngoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.donateBg,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  ngoNoticeText: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.donate,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.lg,
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
