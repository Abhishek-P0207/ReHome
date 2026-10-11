/**
 * Inbox Tab Screen.
 * Conversation rows with item thumbnail, the other participant, last message preview,
 * timestamp, and pending status chips.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ItemImage, StatusChip, EmptyState } from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { chatService } from '@/services';
import type { Conversation, Item, Message, Profile } from '@/types';
import { useAuth } from '@/features/auth/useAuth';
import { useMockDataStore } from '@/store/mockDataStore';
import { formatRelativeTime } from '@/lib/format';
import { haptic } from '@/lib/haptics';

export default function InboxTabScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const items = useMockDataStore((state) => state.items);
  const profiles = useMockDataStore((state) => state.profiles);
  const messages = useMockDataStore((state) => state.messages);
  const storeConversations = useMockDataStore((state) => state.conversations);
  const donationRequests = useMockDataStore((state) => state.donationRequests);
  const organizations = useMockDataStore((state) => state.organizations);

  const loadConversations = useCallback(async () => {
    try {
      const convs = await chatService.listConversations();
      setConversations(convs);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations, messages, storeConversations, donationRequests]);

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const itemData = items.find((i) => i.id === item.itemId);
    const otherUserId = item.buyerId === user?.id ? item.sellerId : item.buyerId;
    const otherUser = profiles.find((p) => p.id === otherUserId);
    const isOwner = item.sellerId === user?.id;

    // Check for donation request
    const donationReq = donationRequests.find((r) => r.itemId === item.itemId);
    const relatedOrg = donationReq
      ? organizations.find((o) => o.id === donationReq.orgId)
      : null;

    const convMessages = messages
      .filter((m) => m.conversationId === item.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const lastMessage = convMessages[0];
    const pendingOffer = convMessages.find(
      (m) => (m.kind === 'offer' || m.kind === 'exchange') && m.status === 'pending',
    );

    let previewText = lastMessage?.body ?? '';
    if (donationReq) {
      if (donationReq.status === 'pending') {
        previewText = isOwner
          ? `Donation request from ${relatedOrg?.name || 'NGO'} • Review to accept/decline`
          : `Donation request submitted • Waiting for donor`;
      } else if (donationReq.status === 'accepted') {
        previewText = 'Donation request accepted • Item completed';
      } else if (donationReq.status === 'declined') {
        previewText = 'Donation request declined';
      }
    } else if (lastMessage?.kind === 'offer') {
      previewText = `Offer: ₹${lastMessage.amount?.toLocaleString('en-IN')}`;
    } else if (lastMessage?.kind === 'exchange') {
      previewText = 'Swap proposal sent';
    }

    const displayName =
      otherUser?.role === 'ngo' && relatedOrg
        ? `${otherUser.displayName} (${relatedOrg.name})`
        : otherUser?.displayName ?? 'User';

    return (
      <Pressable
        onPress={() => {
          haptic.light();
          router.push(`/chat/${item.id}`);
        }}
        style={styles.convCard}
      >
        <ItemImage
          category={itemData?.category ?? 'default'}
          style={styles.thumbnail}
          aspectRatio={1}
        />
        <View style={styles.convInfo}>
          <View style={styles.topRow}>
            <Text style={styles.otherName} numberOfLines={1}>
              {displayName}
            </Text>
            {lastMessage && (
              <Text style={styles.timeText}>
                {formatRelativeTime(lastMessage.createdAt)}
              </Text>
            )}
          </View>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {itemData?.title ?? 'Item'}
          </Text>
          <View style={styles.bottomRow}>
            <Text style={styles.preview} numberOfLines={1}>
              {previewText || 'Start conversation...'}
            </Text>
            {donationReq ? (
              <StatusChip
                status={
                  donationReq.status === 'accepted'
                    ? 'completed'
                    : donationReq.status === 'pending'
                    ? 'pending'
                    : 'reserved'
                }
              />
            ) : pendingOffer ? (
              <StatusChip status="pending" />
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {conversations.length === 0 && !loading ? (
        <EmptyState
          icon="chat-outline"
          title="No conversations yet"
          subtitle="Offers and messages about items will appear here."
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(c) => c.id}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: 110,
  },
  convCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    gap: spacing.md,
    alignItems: 'center',
    ...shadow.soft,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
  },
  convInfo: {
    flex: 1,
    gap: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otherName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  timeText: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  itemTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  preview: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
});
