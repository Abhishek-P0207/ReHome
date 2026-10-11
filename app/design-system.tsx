import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  TypeTag,
  StatusChip,
  ConfidenceBadge,
  ItemCard,
  ItemRow,
  ItemImage,
  ImageCarousel,
  Avatar,
  PriceText,
  AiEstimateCard,
  SearchBar,
  FilterChips,
  BottomSheet,
  ChatBubble,
  OfferCard,
  ExchangeCard,
  SystemMessage,
  TypingIndicator,
  VerifiedBadge,
  NgoCard,
  EmptyState,
  SkeletonCard,
  ErrorState,
  Stepper,
  SectionHeader,
  Snackbar,
} from '@/components';
import { colors, spacing, fontFamily } from '@/theme/tokens';
import type { Item, Organization, AiEstimate } from '@/types';

const sampleItemSell: Item = {
  id: 'sample-1',
  ownerId: 'user-1',
  title: 'Prestige 750W Mixer Grinder',
  description: 'Gently used mixer with 3 jars in great condition.',
  category: 'Kitchen',
  condition: 'good',
  listingType: 'sell',
  price: 1500,
  images: ['sample-img-1'],
  city: 'Chennai',
  status: 'active',
  createdAt: new Date().toISOString(),
};

const sampleItemExchange: Item = {
  id: 'sample-2',
  ownerId: 'user-2',
  title: 'Yamaha acoustic guitar',
  description: 'Good condition acoustic guitar with gig bag.',
  category: 'Music',
  condition: 'good',
  listingType: 'exchange',
  images: [],
  city: 'Chennai',
  status: 'active',
  createdAt: new Date().toISOString(),
};

const sampleItemDonate: Item = {
  id: 'sample-3',
  ownerId: 'user-3',
  title: "Children's storybooks (25 books)",
  description: 'Collection of illustrated storybooks in English and Tamil.',
  category: 'Books',
  condition: 'good',
  listingType: 'donate',
  images: [],
  city: 'Chennai',
  status: 'active',
  createdAt: new Date().toISOString(),
};

const sampleOrg: Organization = {
  id: 'org-1',
  ownerId: 'user-ngo',
  name: 'Asha Kiran Trust',
  description: 'Supporting underprivileged children education and community nourishment.',
  city: 'Chennai',
  registrationNo: 'TN/2019/00912',
  verified: true,
  itemsReceived: 14,
};

const sampleAiEstimate: AiEstimate = {
  min: 1200,
  max: 1800,
  confidence: 'high',
  brand: 'Prestige',
  model: 'Iris 750W',
  reasoning: 'Popular model with steady secondary demand. Good functional condition.',
  mock: true,
};

export default function DesignSystemScreen() {
  const [searchValue, setSearchValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(2);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.screenTitle}>ReHome Design System</Text>
        <Text style={styles.screenSubtitle}>
          Complete showcase of tokens, typography, and reusable components.
        </Text>

        {/* ─── 1. BUTTONS ─── */}
        <SectionHeader title="1. Buttons" subtitle="Primary, Secondary, Ghost, Danger with states" />
        <View style={styles.rowWrap}>
          <Button label="Primary" onPress={() => {}} variant="primary" />
          <Button label="Secondary" onPress={() => {}} variant="secondary" />
          <Button label="Ghost" onPress={() => {}} variant="ghost" />
          <Button label="Danger" onPress={() => {}} variant="danger" />
        </View>
        <View style={styles.rowWrap}>
          <Button label="Loading" onPress={() => {}} loading />
          <Button label="Disabled" onPress={() => {}} disabled />
        </View>

        {/* ─── 2. TAGS & CHIPS & BADGES ─── */}
        <SectionHeader title="2. Tags, Status Chips & Badges" />
        <View style={styles.rowWrap}>
          <TypeTag type="sell" />
          <TypeTag type="exchange" />
          <TypeTag type="donate" />
        </View>
        <View style={styles.rowWrap}>
          <StatusChip status="reserved" />
          <StatusChip status="completed" />
          <StatusChip status="pending" />
          <StatusChip status="verified" />
        </View>
        <View style={styles.rowWrap}>
          <ConfidenceBadge confidence="high" />
          <ConfidenceBadge confidence="medium" />
          <ConfidenceBadge confidence="low" />
        </View>
        <View style={styles.rowWrap}>
          <VerifiedBadge />
          <VerifiedBadge pending />
        </View>

        {/* ─── 3. PRICING & AVATAR ─── */}
        <SectionHeader title="3. Price Formatting & Avatars" />
        <View style={styles.rowWrap}>
          <PriceText amount={450} size="sm" />
          <PriceText amount={1500} size="md" />
          <PriceText amount={65000} size="lg" />
        </View>
        <View style={styles.rowWrap}>
          <Avatar name="Ravi Kumar" color={colors.primary} size={48} />
          <Avatar name="Asha Raman" color={colors.exchange} size={48} />
          <Avatar name="Priya Selvam" color={colors.donate} size={48} />
        </View>

        {/* ─── 4. SEARCH & FILTER CHIPS ─── */}
        <SectionHeader title="4. SearchBar & FilterChips" />
        <View style={{ paddingHorizontal: spacing.lg }}>
          <SearchBar value={searchValue} onChangeText={setSearchValue} />
        </View>
        <View style={{ marginTop: spacing.sm }}>
          <FilterChips
            chips={[
              { key: 'all', label: 'All Items' },
              { key: 'sell', label: 'Sell' },
              { key: 'exchange', label: 'Exchange' },
              { key: 'donate', label: 'Donate' },
            ]}
            selected={selectedFilter}
            onSelect={setSelectedFilter}
          />
        </View>

        {/* ─── 5. AI ESTIMATE CARD ─── */}
        <SectionHeader title="5. AI Estimate Card" />
        <View style={{ paddingHorizontal: spacing.lg }}>
          <AiEstimateCard estimate={sampleAiEstimate} />
        </View>

        {/* ─── 6. ITEM CARDS & ROWS ─── */}
        <SectionHeader title="6. Item Cards (Grid) & Item Rows (List)" />
        <View style={styles.gridRow}>
          <ItemCard item={sampleItemSell} index={0} onPress={() => {}} />
          <ItemCard item={sampleItemExchange} index={1} onPress={() => {}} />
        </View>
        <View style={{ paddingHorizontal: spacing.lg, gap: spacing.md, marginTop: spacing.sm }}>
          <ItemRow item={sampleItemSell} onPress={() => {}} />
          <ItemRow item={sampleItemDonate} onPress={() => {}} />
        </View>

        {/* ─── 7. IMAGE PLACEHOLDER & CAROUSEL ─── */}
        <SectionHeader title="7. Image Placeholders & Carousel" />
        <View style={{ paddingHorizontal: spacing.lg }}>
          <ImageCarousel images={['placeholder-1', 'placeholder-2']} category="Kitchen" height={220} />
        </View>

        {/* ─── 8. CHAT COMPONENTS ─── */}
        <SectionHeader title="8. Chat Components" subtitle="Bubbles, Offer Card, Exchange Card, System Message, Typing" />
        <ChatBubble body="Hi, is this mixer grinder still available?" isOwn={false} timestamp="10:30 AM" />
        <ChatBubble body="Yes, it's available! You can pick it up today." isOwn={true} timestamp="10:32 AM" />
        <OfferCard
          amount={1300}
          status="pending"
          isOwn={false}
          canRespond={true}
          onAccept={() => {}}
          onDecline={() => {}}
        />
        <ExchangeCard
          itemA={{ title: 'Philips air fryer', category: 'Kitchen', value: 3000 }}
          itemB={{ title: 'Yamaha acoustic guitar', category: 'Music', value: 4500 }}
          even={false}
          topupAmount={1500}
          topupPayerName="Ravi"
          status="pending"
          canRespond={true}
        />
        <SystemMessage body="Offer accepted. This item is now reserved." />
        <TypingIndicator />

        {/* ─── 9. NGO CARD ─── */}
        <SectionHeader title="9. NGO Card" />
        <View style={{ paddingHorizontal: spacing.lg }}>
          <NgoCard org={sampleOrg} onPress={() => {}} />
        </View>

        {/* ─── 10. STEPPER & FLOW ─── */}
        <SectionHeader title="10. Stepper Indicator" />
        <Stepper
          currentStep={currentStep}
          totalSteps={4}
          stepTitles={['Photos', 'AI Analysis', 'Details', 'Type & Price']}
        />
        <View style={styles.rowWrap}>
          <Button
            label="Prev Step"
            variant="ghost"
            onPress={() => setCurrentStep((s) => Math.max(1, s - 1))}
          />
          <Button
            label="Next Step"
            variant="secondary"
            onPress={() => setCurrentStep((s) => Math.min(4, s + 1))}
          />
        </View>

        {/* ─── 11. STATES: SKELETON, EMPTY, ERROR ─── */}
        <SectionHeader title="11. Skeletons, Empty & Error States" />
        <View style={styles.gridRow}>
          <SkeletonCard />
          <SkeletonCard />
        </View>
        <EmptyState
          icon="magnify-remove-outline"
          title="Nothing here yet"
          subtitle="Be the first to post in this category."
          actionLabel="Post an Item"
          onAction={() => {}}
        />
        <ErrorState
          message="Simulated network error encountered. You can retry."
          onRetry={() => {}}
        />

        {/* ─── 12. BOTTOM SHEET & TOAST ─── */}
        <SectionHeader title="12. Interactive Modals & Toasts" />
        <View style={styles.rowWrap}>
          <Button
            label="Open Bottom Sheet"
            variant="primary"
            onPress={() => setSheetVisible(true)}
          />
          <Button
            label="Show Snackbar Toast"
            variant="secondary"
            onPress={() => setSnackbarVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Interactive BottomSheet Demo */}
      <BottomSheet visible={sheetVisible} onClose={() => setSheetVisible(false)}>
        <View style={styles.sheetBody}>
          <Text style={styles.sheetTitle}>Interactive Bottom Sheet</Text>
          <Text style={styles.sheetSubtitle}>
            Features spring animation, drag/backdrop dismiss, and keyboard awareness.
          </Text>
          <Button
            label="Dismiss Sheet"
            variant="primary"
            fullWidth
            onPress={() => setSheetVisible(false)}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </BottomSheet>

      {/* Snackbar Demo */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        message="Deal marked completed successfully!"
        type="success"
        actionLabel="OK"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.md,
  },
  screenTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  screenSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  sheetBody: {
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  sheetTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  sheetSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
