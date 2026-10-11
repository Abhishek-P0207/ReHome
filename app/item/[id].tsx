/**
 * Item Detail Screen.
 * Full implementation satisfying all 7 context-aware action states:
 * - Own item: Edit (toast) & Mark as completed
 * - Sell item (other user): Chat with seller & Make an offer
 * - Exchange item (other user): Propose a swap & Chat
 * - Donate item (individual): Chat with donor
 * - Donate item (verified NGO): Request this item
 * - Donate item (unverified NGO): Disabled button + verification banner
 * - Reserved / Completed: Status chip banner + disabled actions
 * - Owner donate item with pending NGO requests: Requests section with Accept / Decline
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  ImageCarousel,
  TypeTag,
  StatusChip,
  PriceText,
  AiEstimateCard,
  Avatar,
  VerifiedBadge,
  Button,
  Snackbar,
} from '@/components';
import { MakeOfferSheet } from '@/features/items/MakeOfferSheet';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import {
  itemsService,
  donationsService,
  chatService,
  profileService,
} from '@/services';
import type {
  Item,
  Profile,
  Organization,
  DonationRequest,
  Condition,
} from '@/types';
import { useAuth } from '@/features/auth/useAuth';
import { useMockDataStore } from '@/store/mockDataStore';
import { formatRelativeTime } from '@/lib/format';
import { haptic } from '@/lib/haptics';

const conditionLabels: Record<Condition, string> = {
  new: 'Brand New',
  like_new: 'Like New',
  good: 'Good Condition',
  fair: 'Fair Condition',
};

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [viewerOrg, setViewerOrg] = useState<Organization | null>(null);
  const [donorRequests, setDonorRequests] = useState<
    Array<{ request: DonationRequest; org: Organization }>
  >([]);

  const [offerSheetVisible, setOfferSheetVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'default' | 'success' | 'error'>('default');
  const [actionLoading, setActionLoading] = useState(false);

  const organizations = useMockDataStore((state) => state.organizations);
  const donationRequests = useMockDataStore((state) => state.donationRequests);

  const loadItemDetails = useCallback(async () => {
    if (!id) return;
    try {
      const data = await itemsService.get(id);
      setItem(data);

      // Load seller info
      const sellerProfile = await profileService.getProfile(data.ownerId);
      setSeller(sellerProfile);

      // If user is NGO, lookup user's org
      if (user?.role === 'ngo') {
        const org = organizations.find((o) => o.ownerId === user.id);
        setViewerOrg(org ?? null);
      }

      // If owner viewing a donate item, check for pending requests
      if (user && data.ownerId === user.id && data.listingType === 'donate') {
        const reqs = await donationsService.listRequestsForItem(data.id);
        const seenOrgs = new Set<string>();
        const uniqueReqs = reqs.filter((r) => {
          if (seenOrgs.has(r.orgId)) return false;
          seenOrgs.add(r.orgId);
          return true;
        });
        const detailedReqs = uniqueReqs.map((r) => {
          const matchedOrg = organizations.find((o) => o.id === r.orgId);
          return {
            request: r,
            org: matchedOrg || {
              id: r.orgId,
              ownerId: '',
              name: 'Community Organization',
              description: '',
              city: 'Local',
              registrationNo: 'VERIFIED',
              verified: true,
              itemsReceived: 0,
            },
          };
        });
        setDonorRequests(detailedReqs);
      }
    } catch {
      // silent
    }
  }, [id, user, organizations]);

  useEffect(() => {
    loadItemDetails();
  }, [loadItemDetails]);

  const showToast = (msg: string, type: 'default' | 'success' | 'error' = 'default') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const handleShare = async () => {
    haptic.light();
    if (!item) return;
    try {
      await Share.share({
        message: `Check out ${item.title} on ReHome!`,
      });
    } catch {
      // dismissed
    }
  };

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleMarkCompleted = async () => {
    if (!item) return;
    try {
      setActionLoading(true);
      haptic.light();
      await itemsService.markCompleted(item.id);
      haptic.success();
      showToast('Item marked as completed!', 'success');
      loadItemDetails();
    } catch (e: any) {
      showToast(e?.message || 'Failed to update item', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChat = async () => {
    if (!item) return;
    try {
      setActionLoading(true);
      haptic.light();
      const conv = await chatService.getOrCreateConversation(item.id);
      router.push(`/chat/${conv.id}`);
    } catch (e: any) {
      showToast(e?.message || 'Failed to open chat', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendOffer = async (amount: number) => {
    if (!item) return;
    const conv = await chatService.getOrCreateConversation(item.id);
    await chatService.sendOffer({ conversationId: conv.id, amount });
    haptic.success();
    showToast(`Offer of ₹${amount.toLocaleString('en-IN')} sent!`, 'success');
    router.push(`/chat/${conv.id}`);
  };

  const handleProposeSwap = async () => {
    if (!item) return;
    const conv = await chatService.getOrCreateConversation(item.id);
    router.push(`/chat/${conv.id}`);
  };

  const handleRequestItem = async () => {
    if (!item) return;
    try {
      setActionLoading(true);
      haptic.light();
      await donationsService.requestItem(item.id);
      haptic.success();
      showToast('Donation request sent! The donor will review it.', 'success');
      loadItemDetails();
    } catch (e: any) {
      showToast(e?.message || 'Could not request item', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRespondToNgo = async (requestId: string, accept: boolean) => {
    try {
      setActionLoading(true);
      haptic.light();
      await donationsService.respond(requestId, accept);
      if (accept) {
        haptic.success();
        showToast('Donation request accepted! Item completed.', 'success');
      } else {
        showToast('Request declined.', 'default');
      }
      loadItemDetails();
    } catch (e: any) {
      showToast(e?.message || 'Failed to respond', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (!item) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading item details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Persona Logic Flags ──────────────────────────────────────────────────
  const isOwner = user?.id === item.ownerId;
  const isReserved = item.status === 'reserved';
  const isCompleted = item.status === 'completed';
  const isInactive = isReserved || isCompleted;

  const isNgoViewer = user?.role === 'ngo';
  const isVerifiedNgo = isNgoViewer && viewerOrg?.verified === true;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Carousel with Overlays */}
        <View style={styles.carouselContainer}>
          <ImageCarousel
            images={item.images}
            category={item.category}
            height={340}
          />

          {/* Floating Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={styles.floatingBack}
            hitSlop={8}
            accessibilityLabel="Back"
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </Pressable>

          {/* Floating Share Button */}
          <Pressable
            onPress={handleShare}
            style={styles.floatingShare}
            hitSlop={8}
            accessibilityLabel="Share"
          >
            <MaterialCommunityIcons name="share-variant" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Core Item Information */}
        <View style={styles.body}>
          {/* Status Chip if inactive */}
          {isInactive && (
            <View style={styles.statusBanner}>
              <StatusChip status={item.status as any} />
              <Text style={styles.statusBannerText}>
                {isReserved
                  ? 'This item is reserved for an accepted deal.'
                  : 'This item transaction has been completed.'}
              </Text>
            </View>
          )}

          {/* Type Tag & Condition */}
          <View style={styles.metaRow}>
            <TypeTag type={item.listingType} />
            <View style={styles.conditionChip}>
              <Text style={styles.conditionText}>
                {conditionLabels[item.condition]}
              </Text>
            </View>
            <Text style={styles.timeAgo}>
              {formatRelativeTime(item.createdAt)}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Price / Free / Open to Swap */}
          <View style={styles.priceRow}>
            {item.listingType === 'donate' ? (
              <Text style={styles.freePrice}>Free (Donation)</Text>
            ) : item.listingType === 'exchange' ? (
              <View style={styles.exchangeBadge}>
                <MaterialCommunityIcons name="swap-horizontal" size={20} color={colors.exchange} />
                <Text style={styles.exchangePrice}>Open to swap</Text>
              </View>
            ) : item.price != null ? (
              <PriceText amount={item.price} size="lg" />
            ) : null}
            <View style={styles.cityBadge}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.cityText}>{item.city}</Text>
            </View>
          </View>

          {/* AI Estimate Card (when present) */}
          {item.ai && (
            <View style={styles.aiSection}>
              <AiEstimateCard estimate={item.ai} />
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Description</Text>
            <Text style={styles.descriptionText}>{item.description}</Text>
          </View>

          {/* Donor Impact Line (for donate items) */}
          {item.listingType === 'donate' && (
            <View style={styles.impactCard}>
              <MaterialCommunityIcons name="hand-heart" size={24} color={colors.donate} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.impactTitle}>Community Impact</Text>
                <Text style={styles.impactBody}>
                  Giving this item directly supports verified local grassroots organizations and community shelters.
                </Text>
              </View>
            </View>
          )}

          {/* Seller / Donor Row */}
          {seller && (
            <View style={styles.sellerRow}>
              <Avatar
                name={seller.displayName}
                color={seller.avatarColor}
                size={48}
              />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.sellerName}>
                  {item.listingType === 'donate' ? 'Donated by ' : 'Listed by '}
                  {seller.displayName}
                </Text>
                <Text style={styles.sellerCity}>{seller.city}</Text>
              </View>
              <View style={styles.ratingPlaceholder}>
                <MaterialCommunityIcons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingText}>4.9 (12)</Text>
              </View>
            </View>
          )}

          {/* ─── PENDING NGO REQUESTS SECTION (for Donate item Owner) ─── */}
          {isOwner && item.listingType === 'donate' && donorRequests.length > 0 && (
            <View style={styles.requestsSection}>
              <Text style={styles.requestsTitle}>
                Donation Requests ({donorRequests.length})
              </Text>
              <Text style={styles.requestsSub}>
                Verified NGOs seeking this item for their community programs.
              </Text>

              {donorRequests.map(({ request, org }) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestOrgHeader}>
                    <Text style={styles.requestOrgName}>{org.name}</Text>
                    <VerifiedBadge pending={!org.verified} />
                  </View>
                  <Text style={styles.requestOrgCity}>{org.city} • Reg: {org.registrationNo}</Text>
                  <Text style={styles.requestOrgDesc} numberOfLines={2}>
                    {org.description}
                  </Text>

                  {request.status === 'pending' && !isInactive ? (
                    <View style={styles.requestBtnRow}>
                      <Button
                        label="Accept"
                        size="sm"
                        variant="primary"
                        onPress={() => handleRespondToNgo(request.id, true)}
                        loading={actionLoading}
                        style={{ flex: 1, height: 36 }}
                      />
                      <Button
                        label="Decline"
                        size="sm"
                        variant="ghost"
                        onPress={() => handleRespondToNgo(request.id, false)}
                        loading={actionLoading}
                        style={{ flex: 1, height: 36 }}
                      />
                    </View>
                  ) : (
                    <StatusChip status={request.status === 'accepted' ? 'completed' : 'reserved'} />
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* ─── STICKY BOTTOM ACTIONS (Context-Aware) ─────────────────────────── */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {/* State 1: Reserved or Completed */}
        {isInactive ? (
          <View style={styles.inactiveBottomRow}>
            <StatusChip status={item.status as any} />
            <Text style={styles.inactiveBottomText}>
              {isReserved
                ? 'Item reserved. Deal pending handover.'
                : 'Deal completed.'}
            </Text>
          </View>
        ) : isOwner ? (
          /* State 2: Own Active Item */
          <View style={styles.bottomBtnRow}>
            <Button
              label="Edit"
              variant="secondary"
              onPress={() => {
                haptic.light();
                showToast('Editing is disabled in demo mode.', 'default');
              }}
              style={styles.flexBtn}
            />
            <Button
              label="Mark completed"
              variant="primary"
              onPress={handleMarkCompleted}
              loading={actionLoading}
              style={styles.flexBtn}
            />
          </View>
        ) : item.listingType === 'sell' ? (
          /* State 3: Sell Item (Other User) */
          <View style={styles.bottomBtnRow}>
            <Button
              label="Chat"
              variant="secondary"
              onPress={handleChat}
              icon={<MaterialCommunityIcons name="chat-outline" size={18} color={colors.primaryDark} />}
              style={styles.chatBtn}
            />
            <Button
              label="Make an offer"
              variant="primary"
              onPress={() => {
                haptic.light();
                setOfferSheetVisible(true);
              }}
              style={styles.mainActionBtn}
            />
          </View>
        ) : item.listingType === 'exchange' ? (
          /* State 4: Exchange Item (Other User) */
          <View style={styles.bottomBtnRow}>
            <Button
              label="Chat"
              variant="secondary"
              onPress={handleChat}
              icon={<MaterialCommunityIcons name="chat-outline" size={18} color={colors.primaryDark} />}
              style={styles.chatBtn}
            />
            <Button
              label="Propose a swap"
              variant="primary"
              onPress={handleProposeSwap}
              icon={<MaterialCommunityIcons name="swap-horizontal" size={18} color={colors.white} />}
              style={styles.mainActionBtn}
            />
          </View>
        ) : isNgoViewer ? (
          /* State 5 & 6: Donate Item (NGO User) */
          isVerifiedNgo ? (
            /* State 5: Verified NGO */
            viewerOrg &&
            donationRequests.some(
              (r) => r.itemId === item.id && r.orgId === viewerOrg.id && r.status === 'pending',
            ) ? (
              <Button
                label="Request Pending • View in Inbox"
                variant="secondary"
                onPress={handleChat}
                icon={
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={18}
                    color={colors.textPrimary}
                  />
                }
                fullWidth
              />
            ) : (
              <Button
                label="Request this item"
                variant="primary"
                onPress={handleRequestItem}
                loading={actionLoading}
                fullWidth
              />
            )
          ) : (
            /* State 6: Unverified NGO */
            <View style={styles.unverifiedContainer}>
              <View style={styles.unverifiedBanner}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.exchange} />
                <Text style={styles.unverifiedText}>
                  Verification pending. You can claim items once approved.
                </Text>
              </View>
              <Button
                label="Request this item"
                variant="primary"
                disabled
                onPress={() => {}}
                fullWidth
              />
            </View>
          )
        ) : (
          /* State 7: Donate Item (Individual User) */
          <Button
            label="Chat with donor"
            variant="primary"
            onPress={handleChat}
            icon={<MaterialCommunityIcons name="chat-outline" size={18} color={colors.white} />}
            fullWidth
          />
        )}
      </View>

      {/* Make Offer Bottom Sheet */}
      {item.price != null && (
        <MakeOfferSheet
          visible={offerSheetVisible}
          onClose={() => setOfferSheetVisible(false)}
          askingPrice={item.price}
          onSendOffer={handleSendOffer}
        />
      )}

      {/* Snackbar Toast */}
      <Snackbar
        visible={!!toastMessage}
        onDismiss={() => setToastMessage(null)}
        message={toastMessage || ''}
        type={toastType}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  carouselContainer: {
    position: 'relative',
    backgroundColor: colors.surface,
  },
  floatingBack: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
    zIndex: 10,
  },
  floatingShare: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
    zIndex: 10,
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusBannerText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  conditionChip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    borderWidth: 1,
    borderColor: colors.border,
  },
  conditionText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  timeAgo: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 'auto',
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  freePrice: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    lineHeight: 28,
    color: colors.donate,
  },
  exchangeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  exchangePrice: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.exchange,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  aiSection: {
    marginTop: spacing.xs,
  },
  section: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  descriptionText: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
  },
  impactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.donateBg,
    padding: spacing.md,
    borderRadius: radius.card,
  },
  impactTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.donate,
  },
  impactBody: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    marginTop: spacing.xs,
    ...shadow.soft,
  },
  sellerName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sellerCity: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  ratingPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.chip,
  },
  ratingText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textPrimary,
  },
  requestsSection: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  requestsTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  requestsSub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: -4,
  },
  requestCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    gap: spacing.xs,
    ...shadow.soft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestOrgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requestOrgName: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  requestOrgCity: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  requestOrgDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginVertical: 2,
  },
  requestBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    ...shadow.medium,
  },
  bottomBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flexBtn: {
    flex: 1,
  },
  chatBtn: {
    width: 100,
  },
  mainActionBtn: {
    flex: 1,
  },
  inactiveBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  inactiveBottomText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  unverifiedContainer: {
    gap: spacing.sm,
  },
  unverifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.exchangeBg,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  unverifiedText: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.exchange,
    flex: 1,
  },
});
