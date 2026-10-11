/**
 * Throwaway Debug Screen for Phase F1 Acceptance.
 * Verifies that items and conversations load strictly through the services layer.
 */
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { itemsService, chatService, authService } from '@/services';
import type { Item, Conversation, Profile } from '@/types';
import { Button, StatusChip, TypeTag, PriceText } from '@/components';
import { colors, spacing, fontFamily, radius } from '@/theme/tokens';

export default function DebugServicesScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Call services strictly
      const user = await authService.getCurrentUser();
      const allItems = await itemsService.list();
      const userConvs = await chatService.listConversations();

      setCurrentUser(user);
      setItems(allItems);
      setConversations(userConvs);
    } catch (err: any) {
      setError(err?.message || 'Failed to load services data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Service Layer Verification (F1)</Text>
        <Text style={styles.subtitle}>
          This debug screen communicates strictly via service interfaces with simulated latency.
        </Text>

        <Button label="Reload via Services" onPress={loadData} variant="secondary" />

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>Simulating network latency (300-900ms)...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Error: {error}</Text>
          </View>
        )}

        {!loading && !error && (
          <>
            {/* Active Persona */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>Active Persona (via authService)</Text>
              <Text style={styles.bodyText}>
                {currentUser ? `${currentUser.displayName} (${currentUser.role}) in ${currentUser.city}` : 'None'}
              </Text>
            </View>

            {/* Items List */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>
                Items Loaded ({items.length}) (via itemsService.list)
              </Text>
              {items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSub}>
                      {item.category} • {item.city} • {item.condition}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <TypeTag type={item.listingType} small />
                    {item.price != null && <PriceText amount={item.price} size="sm" />}
                  </View>
                </View>
              ))}
            </View>

            {/* Conversations List */}
            <View style={styles.card}>
              <Text style={styles.cardHeader}>
                Conversations ({conversations.length}) (via chatService.listConversations)
              </Text>
              {conversations.map((c) => (
                <View key={c.id} style={styles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>Conv #{c.id}</Text>
                    <Text style={styles.itemSub}>
                      Item: {c.itemId} | Buyer: {c.buyerId} | Seller: {c.sellerId}
                    </Text>
                  </View>
                  <StatusChip status="pending" />
                </View>
              ))}
            </View>
          </>
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
    padding: spacing.lg,
    gap: spacing.md,
  },
  heading: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  errorBox: {
    padding: spacing.md,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.card,
  },
  errorText: {
    fontFamily: fontFamily.medium,
    color: colors.danger,
    fontSize: 13,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  bodyText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
});
