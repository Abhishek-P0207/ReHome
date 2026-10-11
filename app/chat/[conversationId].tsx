/**
 * Conversation & Chat Screen.
 * Displays participant information, top item summary with direct link to Item Accept/Decline Page,
 * dedicated Donation Request Card with instant Accept/Decline actions,
 * interactive Offer/Exchange cards, real-time message bubbles, and text input bar.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Button,
  Avatar,
  ItemImage,
  TypeTag,
  StatusChip,
  VerifiedBadge,
  ChatBubble,
  SystemMessage,
  OfferCard,
  ExchangeCard,
  Snackbar,
} from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { formatRelativeTime } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { chatService, donationsService, exchangeService } from '@/services';
import { useAuth } from '@/features/auth/useAuth';
import { useMockDataStore } from '@/store/mockDataStore';
import type { Message } from '@/types';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'default' | 'success' | 'error'>('default');

  const scrollViewRef = useRef<ScrollView>(null);

  // Store data
  const conversations = useMockDataStore((state) => state.conversations);
  const items = useMockDataStore((state) => state.items);
  const profiles = useMockDataStore((state) => state.profiles);
  const organizations = useMockDataStore((state) => state.organizations);
  const donationRequests = useMockDataStore((state) => state.donationRequests);
  const messages = useMockDataStore((state) => state.messages);

  const conversation = conversations.find((c) => c.id === conversationId);
  const item = conversation ? items.find((i) => i.id === conversation.itemId) : null;

  const otherUserId =
    conversation?.buyerId === user?.id ? conversation?.sellerId : conversation?.buyerId;
  const otherUser = profiles.find((p) => p.id === otherUserId);

  const isOwner = Boolean(user && item && item.ownerId === user.id);

  // Donation request details if this item is a donate listing
  const donationReq = item
    ? donationRequests.find((r) => r.itemId === item.id)
    : null;
  const relatedOrg = donationReq
    ? organizations.find((o) => o.id === donationReq.orgId)
    : null;

  const isNgoViewer = Boolean(user && relatedOrg && relatedOrg.ownerId === user.id);

  // Messages in this conversation
  const convMessages = messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Pending offer or exchange
  const acceptedOffer = convMessages.find(
    (m) => (m.kind === 'offer' || m.kind === 'exchange') && m.status === 'accepted',
  );

  useEffect(() => {
    // Scroll to bottom when messages update
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [convMessages.length]);

  const showToast = (msg: string, type: 'default' | 'success' | 'error' = 'default') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !conversationId) return;
    const text = inputMessage.trim();
    setInputMessage('');
    haptic.light();

    try {
      await chatService.sendText(conversationId, text);
    } catch {
      showToast('Failed to send message', 'error');
    }
  };

  const handleRespondDonation = async (accept: boolean) => {
    if (!donationReq) return;
    try {
      setLoadingAction(true);
      haptic.light();
      await donationsService.respond(donationReq.id, accept);
      if (accept) {
        haptic.success();
        showToast('Donation accepted! Item completed.', 'success');
      } else {
        showToast('Donation request declined.', 'default');
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed to update request', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRespondOffer = async (messageId: string, accept: boolean) => {
    if (!conversationId) return;
    try {
      setLoadingAction(true);
      haptic.light();
      await chatService.respondToOffer({
        conversationId,
        messageId,
        accept,
      });
      if (accept) {
        haptic.success();
        showToast('Offer accepted! Item reserved.', 'success');
      } else {
        showToast('Offer declined.', 'default');
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed to respond', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRespondExchange = async (messageId: string, accept: boolean) => {
    if (!conversationId) return;
    try {
      setLoadingAction(true);
      haptic.light();
      await exchangeService.respond(messageId, conversationId, accept);
      if (accept) {
        haptic.success();
        showToast('Swap accepted! Both items reserved.', 'success');
      } else {
        showToast('Swap proposal declined.', 'default');
      }
    } catch (e: any) {
      showToast(e?.message || 'Failed to respond', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!conversationId) return;
    try {
      setLoadingAction(true);
      haptic.success();
      await chatService.markCompleted(conversationId);
      showToast('Deal marked completed! Great job.', 'success');
    } catch (e: any) {
      showToast(e?.message || 'Failed to mark completed', 'error');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleNavigateToItem = () => {
    if (!item) return;
    haptic.light();
    router.push(`/item/${item.id}`);
  };

  if (!conversation || !item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Conversation</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Conversation not found or has expired.</Text>
          <Button label="Back to Inbox" variant="secondary" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const otherDisplayName =
    otherUser?.role === 'ngo' && relatedOrg
      ? `${otherUser.displayName} (${relatedOrg.name})`
      : otherUser?.displayName ?? 'User';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ─── TOP HEADER ────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <View style={styles.headerUserInfo}>
            <Avatar
              name={otherUser?.displayName ?? 'U'}
              color={otherUser?.avatarColor ?? colors.primary}
              size={36}
            />
            <View style={styles.headerNameCol}>
              <View style={styles.nameRow}>
                <Text style={styles.headerName} numberOfLines={1}>
                  {otherDisplayName}
                </Text>
                {relatedOrg?.verified && <VerifiedBadge />}
              </View>
              <Text style={styles.headerSub} numberOfLines={1}>
                {otherUser?.city ?? item.city}
              </Text>
            </View>
          </View>
        </View>

        {/* ─── MINI ITEM SUMMARY (Direct link to Item Accept/Decline Page) ─── */}
        <Pressable
          onPress={handleNavigateToItem}
          style={styles.itemStrip}
          accessibilityLabel="Open Item Details and Accept/Decline Page"
        >
          <ItemImage
            category={item.category}
            style={styles.itemStripImg}
            aspectRatio={1}
          />
          <View style={styles.itemStripInfo}>
            <Text style={styles.itemStripTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.itemStripTagRow}>
              <TypeTag type={item.listingType} />
              <StatusChip status={item.status as any} />
            </View>
          </View>
          <View style={styles.itemStripAction}>
            <Text style={styles.itemStripActionText}>
              {isOwner ? 'Review Page' : 'View Item'}
            </Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={colors.primary}
            />
          </View>
        </Pressable>

        {/* ─── CHAT CONTENT & MESSAGE STREAM ─────────────────────────── */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollInner}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── PROMINENT DONATION REQUEST CARD ─── */}
          {item.listingType === 'donate' && donationReq && (
            <View style={styles.donationCard}>
              <View style={styles.donationHeader}>
                <View style={styles.donationIconCircle}>
                  <MaterialCommunityIcons
                    name="hand-heart"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.donationTitle}>Donation Claim Request</Text>
                  <Text style={styles.donationSub}>
                    {relatedOrg?.name ?? 'Registered NGO'} • {relatedOrg?.city}
                  </Text>
                </View>
                <StatusChip
                  status={
                    donationReq.status === 'accepted'
                      ? 'completed'
                      : donationReq.status === 'pending'
                      ? 'pending'
                      : 'reserved'
                  }
                />
              </View>

              <Text style={styles.donationDesc} numberOfLines={2}>
                {relatedOrg?.description ||
                  'Seeking items for community distribution and charitable outreach programs.'}
              </Text>

              {relatedOrg && (
                <View style={styles.donationMetaRow}>
                  <Text style={styles.donationMetaText}>
                    Reg: {relatedOrg.registrationNo}
                  </Text>
                  <Text style={styles.donationMetaText}>•</Text>
                  <Text style={styles.donationMetaText}>
                    {relatedOrg.itemsReceived} items received
                  </Text>
                </View>
              )}

              {/* Action Buttons for Donor Owner */}
              {isOwner && donationReq.status === 'pending' && (
                <View style={styles.donationActionSection}>
                  <View style={styles.donationBtnRow}>
                    <Button
                      label="Accept"
                      size="sm"
                      variant="primary"
                      onPress={() => handleRespondDonation(true)}
                      loading={loadingAction}
                      icon={
                        <MaterialCommunityIcons
                          name="check"
                          size={16}
                          color={colors.white}
                        />
                      }
                      style={styles.donationActionBtn}
                    />
                    <Button
                      label="Decline"
                      size="sm"
                      variant="ghost"
                      onPress={() => handleRespondDonation(false)}
                      loading={loadingAction}
                      style={styles.donationActionBtn}
                    />
                  </View>
                  <Pressable
                    onPress={handleNavigateToItem}
                    style={styles.donationLinkBtn}
                  >
                    <Text style={styles.donationLinkText}>
                      Open full Item page with NGO verification details →
                    </Text>
                  </Pressable>
                </View>
              )}

              {isOwner && donationReq.status === 'accepted' && (
                <View style={styles.donationAcceptedBox}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={18}
                    color={colors.primary}
                  />
                  <Text style={styles.donationAcceptedText}>
                    Donation accepted! Coordinate pickup or delivery in this chat.
                  </Text>
                </View>
              )}

              {isNgoViewer && donationReq.status === 'pending' && (
                <View style={styles.donationPendingBox}>
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color={colors.exchange}
                  />
                  <Text style={styles.donationPendingText}>
                    Your claim request has been sent to the donor. Coordinate below.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* ─── DEAL COMPLETED BANNER ─── */}
          {acceptedOffer && item.status === 'reserved' && isOwner && (
            <View style={styles.dealCompleteBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dealCompleteTitle}>Deal Handover</Text>
                <Text style={styles.dealCompleteSub}>
                  Completed the handover? Mark the deal finished to update your stats.
                </Text>
              </View>
              <Button
                label="Mark Completed"
                variant="primary"
                onPress={handleMarkCompleted}
                loading={loadingAction}
                style={{ height: 38 }}
              />
            </View>
          )}

          {/* ─── MESSAGE STREAM ─── */}
          {convMessages.map((msg: Message) => {
            const isOwn = msg.senderId === user?.id;

            if (msg.kind === 'system') {
              return <SystemMessage key={msg.id} body={msg.body ?? ''} />;
            }

            if (msg.kind === 'offer') {
              return (
                <View key={msg.id} style={styles.cardWrapper}>
                  <OfferCard
                    amount={msg.amount ?? 0}
                    status={msg.status as any}
                    isOwn={isOwn}
                    canRespond={isOwner && !isOwn}
                    onAccept={() => handleRespondOffer(msg.id, true)}
                    onDecline={() => handleRespondOffer(msg.id, false)}
                  />
                </View>
              );
            }

            if (msg.kind === 'exchange') {
              const offeredItem = msg.offeredItemId
                ? items.find((i) => i.id === msg.offeredItemId)
                : null;
              const payerName =
                msg.topupPayerId === user?.id ? 'You' : otherUser?.displayName ?? 'Other user';

              return (
                <View key={msg.id} style={styles.cardWrapper}>
                  <ExchangeCard
                    itemA={{
                      title: item.title,
                      category: item.category,
                      value: item.price ?? 2000,
                    }}
                    itemB={{
                      title: offeredItem?.title ?? 'Swap Item',
                      category: offeredItem?.category ?? 'Other',
                      value: offeredItem?.price ?? 2000,
                    }}
                    even={(msg.topupAmount ?? 0) === 0}
                    topupAmount={msg.topupAmount ?? 0}
                    topupPayerName={payerName}
                    status={msg.status as any}
                    canRespond={isOwner && !isOwn}
                    onAccept={() => handleRespondExchange(msg.id, true)}
                    onDecline={() => handleRespondExchange(msg.id, false)}
                  />
                </View>
              );
            }

            // Normal text bubble
            return (
              <ChatBubble
                key={msg.id}
                body={msg.body ?? ''}
                isOwn={isOwn}
                timestamp={formatRelativeTime(msg.createdAt)}
              />
            );
          })}
        </ScrollView>

        {/* ─── BOTTOM TEXT INPUT BAR ─────────────────────────────────── */}
        <View
          style={[
            styles.inputBar,
            { paddingBottom: Math.max(insets.bottom, spacing.sm) },
          ]}
        >
          <TextInput
            style={styles.textInput}
            placeholder={`Message ${otherUser?.displayName ?? 'user'}...`}
            placeholderTextColor={colors.textSecondary}
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline={false}
            returnKeyType="send"
            onSubmitEditing={handleSendMessage}
          />
          <Pressable
            onPress={handleSendMessage}
            disabled={!inputMessage.trim()}
            style={[
              styles.sendBtn,
              !inputMessage.trim() && styles.sendBtnDisabled,
            ]}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={inputMessage.trim() ? colors.white : colors.textSecondary}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Snackbar Toast */}
      <Snackbar
        visible={!!toastMessage}
        message={toastMessage ?? ''}
        type={toastType}
        onDismiss={() => setToastMessage(null)}
      />
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerNameCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerName: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  headerSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  emptyText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textSecondary,
  },
  /* Mini item summary strip */
  itemStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  itemStripImg: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
  },
  itemStripInfo: {
    flex: 1,
    gap: 2,
  },
  itemStripTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  itemStripTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemStripAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  itemStripActionText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.primary,
  },
  /* Scroll stream */
  scrollContent: {
    flex: 1,
  },
  scrollInner: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  cardWrapper: {
    paddingHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  /* Donation Card */
  donationCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.primarySoft,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.soft,
  },
  donationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  donationIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donationTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  donationSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  donationDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  donationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  donationMetaText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  donationActionSection: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  donationBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  donationActionBtn: {
    flex: 1,
    height: 36,
  },
  donationLinkBtn: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  donationLinkText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  donationAcceptedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primarySoft,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  donationAcceptedText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.primary,
  },
  donationPendingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#FFF9E6',
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  donationPendingText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.exchange,
  },
  /* Deal Completed Banner */
  dealCompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.md,
    ...shadow.soft,
  },
  dealCompleteTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  dealCompleteSub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  /* Input Bar */
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: radius.chip,
    paddingHorizontal: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: colors.border,
  },
});
