/**
 * Profile Screen.
 * User Avatar, Name, City, Role, Stats (Listed, Deals done, Donated),
 * Quick Persona Switcher, My Items, Demo Controls, and Log Out.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, VerifiedBadge, Button } from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { profileService, authService } from '@/services';
import type { ProfileStats, Organization } from '@/types';
import { useAuth } from '@/features/auth/useAuth';
import { useMockDataStore } from '@/store/mockDataStore';
import { haptic } from '@/lib/haptics';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logOut, switchPersona } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    itemsListed: 0,
    dealsDone: 0,
    itemsDonated: 0,
  });
  const [org, setOrg] = useState<Organization | null>(null);
  const profiles = useMockDataStore((state) => state.profiles);

  const loadProfileData = useCallback(async () => {
    if (!user) return;
    try {
      const userStats = await profileService.getStats(user.id);
      setStats(userStats);

      if (user.role === 'ngo') {
        const organizations = useMockDataStore.getState().organizations;
        const matchingOrg = organizations.find((o) => o.ownerId === user.id);
        setOrg(matchingOrg ?? null);
      }
    } catch {
      // silent fallback
    }
  }, [user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const handleLogout = async () => {
    haptic.light();
    await logOut();
    router.replace('/(auth)/welcome');
  };

  const handleSwitchPersona = async (personaId: string) => {
    haptic.light();
    await switchPersona(personaId);
    haptic.success();
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Card */}
        <View style={styles.userCard}>
          <Avatar name={user.displayName} color={user.avatarColor} size={64} />
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user.displayName}</Text>
              <View
                style={[
                  styles.roleBadge,
                  user.role === 'ngo' ? styles.roleNgo : styles.roleUser,
                ]}
              >
                <Text
                  style={[
                    styles.roleText,
                    user.role === 'ngo' ? styles.roleTextNgo : styles.roleTextUser,
                  ]}
                >
                  {user.role === 'ngo' ? 'NGO' : 'Individual'}
                </Text>
              </View>
            </View>
            <View style={styles.cityRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.cityText}>{user.city}</Text>
            </View>
          </View>
        </View>

        {/* NGO Verification Status Banner if NGO */}
        {user.role === 'ngo' && org && (
          <View style={styles.ngoBanner}>
            <View style={styles.ngoHeader}>
              <Text style={styles.ngoName}>{org.name}</Text>
              <VerifiedBadge pending={!org.verified} />
            </View>
            <Text style={styles.ngoDesc}>
              {org.verified
                ? 'Your organization is verified. You can claim donated household items.'
                : 'Verification pending approval. You can browse and post items while waiting.'}
            </Text>
            <Text style={styles.regNo}>Reg No: {org.registrationNo}</Text>
          </View>
        )}

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{stats.itemsListed}</Text>
            <Text style={styles.statLbl}>Listed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{stats.dealsDone}</Text>
            <Text style={styles.statLbl}>Deals done</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{stats.itemsDonated}</Text>
            <Text style={styles.statLbl}>Donated</Text>
          </View>
        </View>

        {/* Quick Persona Switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SWITCH PERSONA (DEMO)</Text>
          <View style={styles.personaGrid}>
            {profiles.map((p) => {
              const isActive = p.id === user.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => handleSwitchPersona(p.id)}
                  style={[styles.personaChip, isActive && styles.personaChipActive]}
                >
                  <View
                    style={[
                      styles.avatarDot,
                      { backgroundColor: p.avatarColor },
                    ]}
                  />
                  <Text
                    style={[
                      styles.personaName,
                      isActive && styles.personaNameActive,
                    ]}
                  >
                    {p.displayName}
                  </Text>
                  {p.role === 'ngo' && (
                    <Text style={styles.ngoTag}>NGO</Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Navigation Rows */}
        <View style={styles.menuSection}>
          <Pressable
            style={styles.menuRow}
            onPress={() => {
              haptic.light();
              router.push('/my-items');
            }}
          >
            <MaterialCommunityIcons name="package-variant-closed" size={22} color={colors.textPrimary} />
            <Text style={styles.menuTitle}>My items</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.menuRow}
            onPress={() => {
              haptic.light();
              router.push('/demo-controls');
            }}
          >
            <MaterialCommunityIcons name="tune" size={22} color={colors.primary} />
            <Text style={[styles.menuTitle, { color: colors.primary }]}>Demo controls</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.menuRow}
            onPress={() => {
              haptic.light();
              router.push('/design-system');
            }}
          >
            <MaterialCommunityIcons name="palette-swatch-outline" size={22} color={colors.textPrimary} />
            <Text style={styles.menuTitle}>Design system</Text>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Log Out */}
        <Button
          label="Log out"
          variant="ghost"
          onPress={handleLogout}
          fullWidth
          style={styles.logoutBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 130,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.card,
    ...shadow.soft,
  },
  userInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  userName: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  roleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.chip,
  },
  roleUser: {
    backgroundColor: colors.primarySoft,
  },
  roleNgo: {
    backgroundColor: colors.donateBg,
  },
  roleText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
  },
  roleTextUser: {
    color: colors.primaryDark,
  },
  roleTextNgo: {
    color: colors.donate,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  ngoBanner: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    gap: spacing.xs,
    borderLeftWidth: 4,
    borderLeftColor: colors.donate,
    ...shadow.soft,
  },
  ngoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ngoName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  ngoDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  regNo: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    borderRadius: radius.card,
    ...shadow.soft,
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statVal: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  statLbl: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 11,
    letterSpacing: 0.5,
    color: colors.textSecondary,
  },
  personaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  personaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  personaChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  avatarDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  personaName: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  personaNameActive: {
    color: colors.primaryDark,
    fontFamily: fontFamily.semiBold,
  },
  ngoTag: {
    fontSize: 10,
    color: colors.donate,
    fontFamily: fontFamily.bold,
    marginLeft: 2,
  },
  menuSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    ...shadow.soft,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuTitle: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  logoutBtn: {
    marginTop: spacing.xs,
  },
});
