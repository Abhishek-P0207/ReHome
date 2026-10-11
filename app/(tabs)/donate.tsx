/**
 * Donate Tab Screen.
 * Verified NGO banner, filter chips, NGO cards list, and quick donate items carousel.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NgoCard, FilterChips, ItemCard } from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { donationsService, itemsService } from '@/services';
import type { Organization, Item } from '@/types';
import { haptic } from '@/lib/haptics';

export default function DonateTabScreen() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [donateItems, setDonateItems] = useState<Item[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified' | 'pending'>('all');

  const loadData = useCallback(async () => {
    try {
      const allOrgs = await donationsService.listOrganizations();
      setOrgs(allOrgs);

      const items = await itemsService.list({ type: 'donate' });
      setDonateItems(items);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredOrgs = orgs.filter((org) => {
    if (selectedFilter === 'verified') return org.verified;
    if (selectedFilter === 'pending') return !org.verified;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Banner */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="shield-check" size={24} color={colors.primary} />
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.bannerTitle}>Verified Local NGOs</Text>
            <Text style={styles.bannerSubtitle}>
              Give directly to verified grassroots non-profits serving your neighborhood.
            </Text>
          </View>
        </View>

        {/* Filter Chips */}
        <FilterChips
          chips={[
            { key: 'all', label: 'All NGOs' },
            { key: 'verified', label: 'Verified' },
            { key: 'pending', label: 'Pending' },
          ]}
          selected={selectedFilter}
          onSelect={(k) => setSelectedFilter(k as any)}
        />

        {/* NGO List */}
        <View style={styles.list}>
          {filteredOrgs.map((org) => (
            <NgoCard
              key={org.id}
              org={org}
              onPress={() => {
                haptic.light();
                router.push(`/ngo/${org.id}`);
              }}
            />
          ))}
        </View>

        {/* Items you can donate strip */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Donate Items Available</Text>
          <Text style={styles.sectionDesc}>Items listed by community members for donation</Text>
        </View>

        <View style={styles.grid}>
          {donateItems.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              index={idx}
              onPress={() => {
                haptic.light();
                router.push(`/item/${item.id}`);
              }}
            />
          ))}
        </View>
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
    paddingBottom: 110,
    gap: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.card,
  },
  bannerTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.primaryDark,
  },
  bannerSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: 2,
  },
  sectionTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  sectionDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
});
