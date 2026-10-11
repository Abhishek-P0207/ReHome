/**
 * Home Feed Screen.
 * 2-column masonry-like grid of ItemCards, 250ms debounced search,
 * category & type filter chips, 700ms initial skeleton loading,
 * pull-to-refresh, and empty state.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  SearchBar,
  FilterChips,
  ItemCard,
  SkeletonCard,
  EmptyState,
  ErrorState,
} from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { itemsService } from '@/services';
import type { Item, ListingType } from '@/types';
import { useAuth } from '@/features/auth/useAuth';
import { useMockDataStore } from '@/store/mockDataStore';
import { useDebounce } from '@/hooks/useDebounce';
import { haptic } from '@/lib/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const storeItems = useMockDataStore((state) => state.items);

  const [items, setItems] = useState<Item[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchInput, setSearchInput] = useState('');
  const debouncedQuery = useDebounce(searchInput, 250);

  const loadItems = useCallback(async (isRefresh = false) => {
    try {
      setError(null);
      if (isRefresh) setRefreshing(true);

      const filterType =
        selectedFilter === 'all' ? undefined : (selectedFilter as ListingType);

      const data = await itemsService.list({
        type: filterType,
        query: debouncedQuery,
      });
      setItems(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load items.');
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter, debouncedQuery]);

  useEffect(() => {
    loadItems();
  }, [loadItems, storeItems]);

  const onRefresh = () => {
    haptic.light();
    loadItems(true);
  };

  const filterChips = [
    { key: 'all', label: 'All' },
    { key: 'sell', label: 'Sell' },
    { key: 'exchange', label: 'Exchange' },
    { key: 'donate', label: 'Donate' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header with Greeting & City Chip */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.displayName ?? 'Neighbor'}
            </Text>
            <Text style={styles.subGreeting}>Give your stuff a second life</Text>
          </View>
          <View style={styles.cityChip}>
            <MaterialCommunityIcons name="map-marker" size={14} color={colors.primary} />
            <Text style={styles.cityText}>{user?.city ?? 'Chennai'}</Text>
          </View>
        </View>

        {/* Search Bar (Debounced 250ms) */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchInput}
            onChangeText={(text) => setSearchInput(text)}
            placeholder="Search title, brand, or category..."
          />
        </View>

        {/* Filter Chips */}
        <FilterChips
          chips={filterChips}
          selected={selectedFilter}
          onSelect={(key) => {
            haptic.light();
            setSelectedFilter(key);
          }}
        />

        {/* Items Grid / Loading / Empty / Error */}
        {initialLoading && !refreshing ? (
          <View style={styles.grid}>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : error ? (
          <ErrorState message={error} onRetry={() => loadItems()} />
        ) : items.length === 0 ? (
          <EmptyState
            icon="magnify-remove-outline"
            title="Nothing here yet."
            subtitle="Be the first to post."
            actionLabel="Post an item"
            onAction={() => router.push('/post')}
          />
        ) : (
          <View style={styles.grid}>
            {items.map((item, index) => (
              <ItemCard
                key={item.id}
                item={item}
                index={index}
                onPress={() => {
                  haptic.light();
                  router.push(`/item/${item.id}`);
                }}
              />
            ))}
          </View>
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  greeting: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  subGreeting: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  cityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
  },
  cityText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.primaryDark,
  },
  searchSection: {
    paddingHorizontal: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
});
