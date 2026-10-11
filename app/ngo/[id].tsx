/**
 * NGO Detail Screen Placeholder (Full implementation in Phase F7).
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { donationsService } from '@/services';
import type { Organization } from '@/types';
import { Button, VerifiedBadge } from '@/components';
import { colors, spacing, fontFamily, radius } from '@/theme/tokens';

export default function NgoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [org, setOrg] = useState<Organization | null>(null);

  useEffect(() => {
    if (id) {
      donationsService.getOrganization(id).then(setOrg).catch(() => {});
    }
  }, [id]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Button label="Back" variant="ghost" onPress={() => router.back()} />
        <Text style={styles.headerTitle}>NGO Details</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {org && (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={styles.name}>{org.name}</Text>
              <VerifiedBadge pending={!org.verified} />
            </View>
            <Text style={styles.city}>{org.city}</Text>
            <Text style={styles.desc}>{org.description}</Text>
            <Text style={styles.reg}>Reg No: {org.registrationNo}</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.card,
    gap: spacing.sm,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  city: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  desc: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  reg: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
