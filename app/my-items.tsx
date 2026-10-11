/**
 * My Items Screen.
 * Tabs: Active, Reserved, Completed.
 * Shows user's listings with quick actions (Mark completed, Remove) and empty states.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, Pressable, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ItemRow, FilterChips, Button, EmptyState } from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { itemsService } from '@/services';
import type { Item, ItemStatus } from '@/types';
import { haptic } from '@/lib/haptics';

export default function MyItemsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedTab, setSelectedTab] = useState<'active' | 'reserved' | 'completed'>('active');
  const [loading, setLoading] = useState(true);

  const loadMyItems = useCallback(async () => {
    try {
      setLoading(true);
      const myItems = await itemsService.listMine();
      setItems(myItems);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMyItems();
  }, [loadMyItems]);

  const handleMarkCompleted = async (itemId: string) => {
    haptic.light();
    await itemsService.markCompleted(itemId);
    haptic.success();
    loadMyItems();
  };

  const handleRemove = async (itemId: string) => {
    haptic.warning();
    Alert.alert('Remove Listing', 'Are you sure you want to delete this listing?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await itemsService.remove(itemId);
          loadMyItems();
        },
      },
    ]);
  };

  const filtered = items.filter((i) => i.status === selectedTab);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>My Items</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <FilterChips
        chips={[
          { key: 'active', label: 'Active' },
          { key: 'reserved', label: 'Reserved' },
          { key: 'completed', label: 'Completed' },
        ]}
        selected={selectedTab}
        onSelect={(tab) => {
          haptic.light();
          setSelectedTab(tab as any);
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="package-variant-closed"
            title={`No ${selectedTab} items`}
            subtitle={
              selectedTab === 'active'
                ? 'You have no active listings right now.'
                : `You do not have any items in ${selectedTab} state.`
            }
            actionLabel={selectedTab === 'active' ? 'Post an item' : undefined}
            onAction={() => router.push('/post')}
          />
        ) : (
          <View style={styles.list}>
            {filtered.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onPress={() => router.push(`/item/${item.id}`)}
                actions={
                  selectedTab === 'active' ? (
                    <>
                      <Button
                        label="Complete"
                        variant="secondary"
                        onPress={() => handleMarkCompleted(item.id)}
                        style={styles.actionBtn}
                      />
                      <Button
                        label="Remove"
                        variant="ghost"
                        onPress={() => handleRemove(item.id)}
                        style={styles.actionBtn}
                      />
                    </>
                  ) : selectedTab === 'reserved' ? (
                    <Button
                      label="Complete"
                      variant="primary"
                      onPress={() => handleMarkCompleted(item.id)}
                      style={styles.actionBtn}
                    />
                  ) : undefined
                }
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 60,
  },
  list: {
    gap: spacing.md,
  },
  actionBtn: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
});
