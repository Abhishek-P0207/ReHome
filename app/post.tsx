/**
 * Post Flow Screen (Phase F4).
 * 4-Step Stepper Flow:
 * 1. Photos: 1-3 photos from camera, gallery, or sample photos with remove buttons.
 * 2. Animated AI Analysis: 2.5s multi-check simulation, supports all 5 AI scenarios including flagged blocking screen.
 * 3. Details: Title, Brand, Category, Condition, Description prefilled from AI with "AI suggested" tags and low-confidence hint card.
 * 4. Type & Price: Sell with live Fair Range bar, Exchange with swap valuation, Donate with NGO note.
 * 5. Success screen with checkmark, View Listing, Post Another, and Home options.
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
  ActivityIndicator,
  Animated,
  BackHandler,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useNavigation } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {
  Button,
  Stepper,
  TypeTag,
  ConfidenceBadge,
  AiEstimateCard,
  ItemImage,
  PriceText,
  formatINR,
  Snackbar,
} from '@/components';
import { colors, spacing, fontFamily, radius, shadow } from '@/theme/tokens';
import { aiService, itemsService } from '@/services';
import { useAuth } from '@/features/auth/useAuth';
import { haptic } from '@/lib/haptics';
import type { Condition, ListingType, Item } from '@/types';
import type { AiAnalysisResult, CreateItemDraft } from '@/services/types';

const CATEGORIES = [
  'Kitchen',
  'Electronics',
  'Phones',
  'Furniture',
  'Books',
  'Clothing',
  'Footwear',
  'Music',
  'Home',
  'Other',
];

const CONDITIONS: Array<{ value: Condition; label: string; desc: string }> = [
  { value: 'like_new', label: 'Like New', desc: 'Flawless, barely used' },
  { value: 'good', label: 'Good', desc: 'Minor wear, fully functional' },
  { value: 'fair', label: 'Fair', desc: 'Noticeable wear, works fine' },
];

export default function PostScreen() {
  const router = useRouter();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  // Current Step: 1 (Photos), 2 (AI Analysis), 3 (Details), 4 (Type & Price), 5 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Photos
  const [photos, setPhotos] = useState<string[]>([]);

  // Step 2: AI Analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<number>(0);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);

  // Step 3: Details state
  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Kitchen');
  const [condition, setCondition] = useState<Condition>('good');
  const [description, setDescription] = useState('');

  // Track if fields are pristine from AI (to show "AI suggested" tag)
  const [titleIsAi, setTitleIsAi] = useState(true);
  const [brandIsAi, setBrandIsAi] = useState(true);
  const [descIsAi, setDescIsAi] = useState(true);

  // Step 4: Type & Price state
  const [listingType, setListingType] = useState<ListingType>('sell');
  const [priceInput, setPriceInput] = useState<string>('1500');
  const [city, setCity] = useState(user?.city || 'Chennai');

  // Publishing & Result
  const [publishing, setPublishing] = useState(false);
  const [createdItem, setCreatedItem] = useState<Item | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'default' | 'success' | 'error'>('default');

  // Animation values for AI analysis
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const showToast = (msg: string, type: 'default' | 'success' | 'error' = 'default') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // ─── STEP 1: PHOTO SELECTION ──────────────────────────────────────────────

  const handlePickFromGallery = async () => {
    if (photos.length >= 3) {
      showToast('Maximum 3 photos allowed', 'default');
      return;
    }
    haptic.light();
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setPhotos((prev) => [...prev, res.assets[0].uri].slice(0, 3));
      }
    } catch {
      showToast('Could not open gallery', 'error');
    }
  };

  const handleTakePhoto = async () => {
    if (photos.length >= 3) {
      showToast('Maximum 3 photos allowed', 'default');
      return;
    }
    haptic.light();
    try {
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        setPhotos((prev) => [...prev, res.assets[0].uri].slice(0, 3));
      }
    } catch {
      showToast('Could not open camera', 'error');
    }
  };

  const handleUseSamplePhotos = () => {
    haptic.light();
    setPhotos(['item-1', 'item-6']);
    showToast('Loaded sample photos for demonstration', 'success');
  };

  const handleRemovePhoto = (index: number) => {
    haptic.light();
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // ─── STEP 2: AI ANALYSIS TRIGGER ──────────────────────────────────────────

  const runAiAnalysis = async () => {
    if (photos.length === 0) {
      showToast('Please add at least 1 photo to analyze', 'error');
      return;
    }

    haptic.light();
    setCurrentStep(2);
    setAnalyzing(true);
    setAnalysisStage(1);

    // Multi-stage animated simulation (~2.5 seconds total)
    const timer1 = setTimeout(() => {
      setAnalysisStage(2);
    }, 800);

    const timer2 = setTimeout(() => {
      setAnalysisStage(3);
    }, 1600);

    try {
      const result = await aiService.analyzeItem({ photos });
      setAiResult(result);

      if (result.safe) {
        // Prefill Step 3 fields
        setTitle(result.identification.title || '');
        setBrand(result.identification.brand || '');
        setCategory(result.identification.category || 'Kitchen');
        setCondition(result.identification.condition || 'good');
        setDescription(result.identification.description || '');

        setTitleIsAi(true);
        setBrandIsAi(true);
        setDescIsAi(true);

        // Prefill Step 4 price
        if (result.estimate) {
          const midpoint =
            Math.round(((result.estimate.min + result.estimate.max) / 2) / 50) * 50;
          setPriceInput(String(midpoint));
        }
      }
    } catch {
      showToast('AI analysis failed. Please try again.', 'error');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setAnalyzing(false);
    }
  };

  // ─── STEP 4: PUBLISH ITEM ─────────────────────────────────────────────────

  const handlePublish = async () => {
    if (!title.trim()) {
      showToast('Please enter an item title', 'error');
      return;
    }

    const price = listingType === 'sell' ? Number(priceInput) || 0 : undefined;
    if (listingType === 'sell' && (!price || price <= 0)) {
      showToast('Please enter a valid asking price', 'error');
      return;
    }

    try {
      setPublishing(true);
      haptic.light();

      const draft: CreateItemDraft = {
        title: title.trim(),
        description: description.trim() || 'Quality pre-loved item listed on ReHome.',
        category,
        condition,
        listingType,
        price,
        ai: aiResult?.estimate,
        images: photos.length > 0 ? photos : ['item-1'],
        city: city.trim() || user?.city || 'Chennai',
      };

      const item = await itemsService.create(draft);
      setCreatedItem(item);
      haptic.success();
      setCurrentStep(5); // Success Screen
    } catch (e: any) {
      showToast(e?.message || 'Failed to publish listing', 'error');
    } finally {
      setPublishing(false);
    }
  };

  const handleResetForm = () => {
    haptic.light();
    setPhotos([]);
    setAiResult(null);
    setTitle('');
    setBrand('');
    setCategory('Kitchen');
    setCondition('good');
    setDescription('');
    setPriceInput('1500');
    setCurrentStep(1);
    setCreatedItem(null);
  };

  const handleCloseOrHome = () => {
    haptic.light();
    handleResetForm();
    try {
      navigation.navigate('index');
    } catch {
      // ignore
    }
    try {
      router.replace('/(tabs)');
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      haptic.light();
      if (currentStep > 1 && currentStep <= 4) {
        setCurrentStep((prev) => prev - 1);
        return true;
      }
      handleCloseOrHome();
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [currentStep]);

  // ─── RENDER STEP 1: PHOTOS ────────────────────────────────────────────────

  const renderStepPhotos = () => (
    <ScrollView contentContainerStyle={styles.stepScroll}>
      <Text style={styles.stepHeading}>Add Photos of Your Item</Text>
      <Text style={styles.stepSub}>
        Add 1 to 3 clear photos. Our AI will automatically identify the brand, category,
        and fair valuation.
      </Text>

      {/* Action buttons */}
      <View style={styles.photoActionsRow}>
        <Button
          label="Take Photo"
          variant="secondary"
          size="sm"
          icon={<MaterialCommunityIcons name="camera" size={18} color={colors.primaryDark} />}
          onPress={handleTakePhoto}
          style={{ flex: 1 }}
        />
        <Button
          label="Gallery"
          variant="secondary"
          size="sm"
          icon={<MaterialCommunityIcons name="image" size={18} color={colors.primaryDark} />}
          onPress={handlePickFromGallery}
          style={{ flex: 1 }}
        />
      </View>

      <Button
        label="Use Sample Photos (Simulator demo)"
        variant="ghost"
        size="sm"
        icon={<MaterialCommunityIcons name="auto-fix" size={16} color={colors.primary} />}
        onPress={handleUseSamplePhotos}
        style={{ marginTop: spacing.xs }}
      />

      {/* Photos Grid */}
      <View style={styles.photoGrid}>
        {photos.map((uri, index) => (
          <View key={index} style={styles.photoSlot}>
            <ItemImage uri={uri} category="default" style={styles.photoImg} />
            <Pressable
              onPress={() => handleRemovePhoto(index)}
              style={styles.removePhotoBtn}
              accessibilityLabel="Remove photo"
            >
              <MaterialCommunityIcons name="close" size={16} color={colors.white} />
            </Pressable>
            <View style={styles.photoIndexBadge}>
              <Text style={styles.photoIndexText}>{index + 1}</Text>
            </View>
          </View>
        ))}

        {photos.length < 3 && (
          <Pressable
            onPress={handlePickFromGallery}
            style={styles.addPhotoSlot}
            accessibilityLabel="Add another photo"
          >
            <MaterialCommunityIcons name="camera-plus-outline" size={28} color={colors.primary} />
            <Text style={styles.addPhotoText}>+ Add Photo</Text>
            <Text style={styles.addPhotoSub}>{photos.length}/3 added</Text>
          </Pressable>
        )}
      </View>

      {/* Tips Box */}
      <View style={styles.tipBox}>
        <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={colors.exchange} />
        <View style={{ flex: 1 }}>
          <Text style={styles.tipTitle}>Photo Tips for Best Valuation</Text>
          <Text style={styles.tipText}>
            Capture front, back, brand tags, and any signs of wear in bright, natural light.
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  // ─── RENDER STEP 2: ANIMATED AI ANALYSIS ──────────────────────────────────

  const renderStepAiAnalysis = () => {
    if (analyzing) {
      return (
        <View style={styles.aiLoadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} style={{ marginBottom: spacing.lg }} />
          <Text style={styles.aiLoadingTitle}>Analyzing with ReHome AI</Text>
          <Text style={styles.aiLoadingSub}>Inspecting visual features and market pricing...</Text>

          <View style={styles.aiChecklist}>
            <View style={styles.aiCheckRow}>
              <MaterialCommunityIcons
                name={analysisStage >= 1 ? 'check-circle' : 'circle-outline'}
                size={22}
                color={analysisStage >= 1 ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.aiCheckText, analysisStage >= 1 && styles.aiCheckTextActive]}>
                Checking photos are safe & compliant
              </Text>
            </View>

            <View style={styles.aiCheckRow}>
              <MaterialCommunityIcons
                name={
                  analysisStage >= 2
                    ? 'check-circle'
                    : analysisStage === 1
                    ? 'loading'
                    : 'circle-outline'
                }
                size={22}
                color={analysisStage >= 2 ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.aiCheckText, analysisStage >= 2 && styles.aiCheckTextActive]}>
                Identifying item category & brand features
              </Text>
            </View>

            <View style={styles.aiCheckRow}>
              <MaterialCommunityIcons
                name={analysisStage >= 3 ? 'check-circle' : 'circle-outline'}
                size={22}
                color={analysisStage >= 3 ? colors.primary : colors.textSecondary}
              />
              <Text style={[styles.aiCheckText, analysisStage >= 3 && styles.aiCheckTextActive]}>
                Estimating fair valuation range
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // Flagged Scenario Block
    if (aiResult && !aiResult.safe) {
      return (
        <View style={styles.flaggedContainer}>
          <View style={styles.flaggedIconCircle}>
            <MaterialCommunityIcons name="shield-alert-outline" size={44} color={colors.danger} />
          </View>
          <Text style={styles.flaggedTitle}>Unable to List This Item</Text>
          <Text style={styles.flaggedReason}>
            {aiResult.moderationReason ||
              'This item appears to contain restricted or prohibited content and cannot be listed on ReHome.'}
          </Text>
          <Text style={styles.flaggedSub}>
            ReHome automated safety filters ensure our community remains safe and trustworthy for everyone.
          </Text>

          <Button
            label="Choose Different Photos"
            variant="primary"
            onPress={() => {
              setPhotos([]);
              setCurrentStep(1);
            }}
            icon={<MaterialCommunityIcons name="camera-retake" size={18} color={colors.white} />}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      );
    }

    // Clean AI Result
    return (
      <ScrollView contentContainerStyle={styles.stepScroll}>
        <View style={styles.aiSuccessHeader}>
          <View style={styles.aiCheckCircle}>
            <MaterialCommunityIcons name="check" size={24} color={colors.white} />
          </View>
          <Text style={styles.aiSuccessTitle}>Item Identified!</Text>
          <Text style={styles.aiSuccessSub}>Review the AI suggestions before continuing to details.</Text>
        </View>

        {aiResult?.estimate && <AiEstimateCard estimate={aiResult.estimate} />}

        <View style={styles.aiDetectedCard}>
          <Text style={styles.aiDetectedHeader}>Detected Details</Text>
          <View style={styles.aiDetectedRow}>
            <Text style={styles.aiDetectedLabel}>Title:</Text>
            <Text style={styles.aiDetectedVal}>{title}</Text>
          </View>
          {brand ? (
            <View style={styles.aiDetectedRow}>
              <Text style={styles.aiDetectedLabel}>Brand:</Text>
              <Text style={styles.aiDetectedVal}>{brand}</Text>
            </View>
          ) : null}
          <View style={styles.aiDetectedRow}>
            <Text style={styles.aiDetectedLabel}>Category:</Text>
            <Text style={styles.aiDetectedVal}>{category}</Text>
          </View>
          <View style={styles.aiDetectedRow}>
            <Text style={styles.aiDetectedLabel}>Condition:</Text>
            <Text style={styles.aiDetectedVal}>
              {condition === 'like_new' ? 'Like New' : condition === 'good' ? 'Good' : 'Fair'}
            </Text>
          </View>
        </View>

        <Button
          label="Continue to Details →"
          variant="primary"
          onPress={() => setCurrentStep(3)}
          style={{ marginTop: spacing.md }}
        />

        <Button
          label="Re-take Photos"
          variant="ghost"
          size="sm"
          onPress={() => setCurrentStep(1)}
        />
      </ScrollView>
    );
  };

  // ─── RENDER STEP 3: DETAILS ───────────────────────────────────────────────

  const renderStepDetails = () => (
    <ScrollView contentContainerStyle={styles.stepScroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.stepHeading}>Item Details</Text>
      <Text style={styles.stepSub}>
        Review and edit the detected information. Fields with AI suggested data are highlighted.
      </Text>

      {/* Title */}
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.formLabel}>Title *</Text>
          {titleIsAi && (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI suggested</Text>
            </View>
          )}
        </View>
        <TextInput
          style={styles.textInput}
          value={title}
          onChangeText={(val) => {
            setTitle(val);
            setTitleIsAi(false);
          }}
          placeholder="e.g. Prestige 750W Mixer Grinder"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Brand */}
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.formLabel}>Brand (Optional)</Text>
          {brandIsAi && brand ? (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI suggested</Text>
            </View>
          ) : null}
        </View>
        <TextInput
          style={styles.textInput}
          value={brand}
          onChangeText={(val) => {
            setBrand(val);
            setBrandIsAi(false);
          }}
          placeholder="e.g. Prestige, Nike, Dell"
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Category Chips */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Category</Text>
        <View style={styles.chipGrid}>
          {CATEGORIES.map((cat) => {
            const isSelected = category === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => {
                  haptic.light();
                  setCategory(cat);
                }}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Condition Segmented Choice */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Condition</Text>
        <View style={styles.conditionRow}>
          {CONDITIONS.map((cond) => {
            const isSelected = condition === cond.value;
            return (
              <Pressable
                key={cond.value}
                onPress={() => {
                  haptic.light();
                  setCondition(cond.value);
                }}
                style={[styles.conditionCard, isSelected && styles.conditionCardSelected]}
              >
                <Text
                  style={[
                    styles.conditionCardTitle,
                    isSelected && styles.conditionCardTitleSelected,
                  ]}
                >
                  {cond.label}
                </Text>
                <Text style={styles.conditionCardDesc}>{cond.desc}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Description */}
      <View style={styles.formGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.formLabel}>Description</Text>
          {descIsAi && description ? (
            <View style={styles.aiBadge}>
              <Text style={styles.aiBadgeText}>AI suggested</Text>
            </View>
          ) : null}
        </View>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={description}
          onChangeText={(val) => {
            setDescription(val);
            setDescIsAi(false);
          }}
          placeholder="Describe included accessories, usage history, and condition..."
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Low confidence hint card */}
      {aiResult?.estimate?.confidence === 'low' && (
        <View style={styles.hintCard}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color={colors.exchange} />
          <View style={{ flex: 1 }}>
            <Text style={styles.hintTitle}>Need a sharper valuation?</Text>
            <Text style={styles.hintText}>
              Adding a specific model name or extra photos helps buyers discover your item faster.
            </Text>
          </View>
        </View>
      )}

      {/* Buttons */}
      <Button
        label="Next: Type & Price →"
        variant="primary"
        onPress={() => {
          if (!title.trim()) {
            showToast('Please enter an item title', 'error');
            return;
          }
          haptic.light();
          setCurrentStep(4);
        }}
        style={{ marginTop: spacing.md }}
      />
      <Button label="Back" variant="ghost" size="sm" onPress={() => setCurrentStep(2)} />
    </ScrollView>
  );

  // ─── RENDER STEP 4: TYPE AND PRICE ────────────────────────────────────────

  const renderStepTypeAndPrice = () => {
    const aiMin = aiResult?.estimate?.min ?? 1000;
    const aiMax = aiResult?.estimate?.max ?? 2000;
    const priceNum = Number(priceInput) || 0;
    const isAboveRange = priceNum > aiMax * 1.2;
    const isBelowRange = priceNum < aiMin * 0.8 && priceNum > 0;
    const isFairRange = priceNum >= aiMin && priceNum <= aiMax;

    return (
      <ScrollView contentContainerStyle={styles.stepScroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.stepHeading}>Listing Type & Price</Text>
        <Text style={styles.stepSub}>
          Choose how you would like to pass this item forward to someone in your city.
        </Text>

        {/* 3-Card Choice */}
        <View style={styles.typeCardsRow}>
          {/* Sell */}
          <Pressable
            onPress={() => {
              haptic.light();
              setListingType('sell');
            }}
            style={[styles.typeCard, listingType === 'sell' && styles.typeCardSelectedSell]}
          >
            <TypeTag type="sell" />
            <Text style={styles.typeCardTitle}>Sell</Text>
            <Text style={styles.typeCardSub}>Set your asking price for local buyers</Text>
          </Pressable>

          {/* Exchange */}
          <Pressable
            onPress={() => {
              haptic.light();
              setListingType('exchange');
            }}
            style={[styles.typeCard, listingType === 'exchange' && styles.typeCardSelectedExchange]}
          >
            <TypeTag type="exchange" />
            <Text style={styles.typeCardTitle}>Exchange</Text>
            <Text style={styles.typeCardSub}>Trade for another pre-loved item</Text>
          </Pressable>

          {/* Donate */}
          <Pressable
            onPress={() => {
              haptic.light();
              setListingType('donate');
            }}
            style={[styles.typeCard, listingType === 'donate' && styles.typeCardSelectedDonate]}
          >
            <TypeTag type="donate" />
            <Text style={styles.typeCardTitle}>Donate</Text>
            <Text style={styles.typeCardSub}>Give to verified NGOs for free</Text>
          </Pressable>
        </View>

        {/* Dynamic Section Based on Selected Type */}
        {listingType === 'sell' && (
          <View style={styles.priceSection}>
            <Text style={styles.formLabel}>Asking Price (₹) *</Text>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.rupeePrefix}>₹</Text>
              <TextInput
                style={styles.priceInput}
                value={priceInput}
                onChangeText={setPriceInput}
                keyboardType="numeric"
                placeholder="1500"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Fair Range Bar */}
            <View style={styles.fairRangeBox}>
              <View style={styles.fairRangeHeader}>
                <Text style={styles.fairRangeTitle}>AI Estimated Fair Range</Text>
                <Text style={styles.fairRangeValues}>
                  {formatINR(aiMin)} – {formatINR(aiMax)}
                </Text>
              </View>

              {/* Progress Track */}
              <View style={styles.rangeTrack}>
                <View style={styles.rangeTargetZone} />
              </View>

              {/* Warning or Success Message */}
              {isFairRange ? (
                <View style={styles.fairStatusRow}>
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.primary} />
                  <Text style={styles.fairStatusSuccess}>
                    Fair Price! Items priced within the AI range sell 3x faster.
                  </Text>
                </View>
              ) : isAboveRange ? (
                <View style={styles.fairStatusRow}>
                  <MaterialCommunityIcons name="alert-outline" size={16} color={colors.exchange} />
                  <Text style={styles.fairStatusWarning}>
                    Asking price is above AI range. Consider lowering for quicker deal interest.
                  </Text>
                </View>
              ) : isBelowRange ? (
                <View style={styles.fairStatusRow}>
                  <MaterialCommunityIcons name="tag-outline" size={16} color={colors.primary} />
                  <Text style={styles.fairStatusGoodDeal}>
                    Great deal! Your price is below market valuation.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {listingType === 'exchange' && (
          <View style={styles.exchangeNoticeCard}>
            <View style={styles.exchangeNoticeHeader}>
              <MaterialCommunityIcons name="swap-horizontal" size={24} color={colors.exchange} />
              <Text style={styles.exchangeNoticeTitle}>Swap Valuation: {formatINR(Math.round((aiMin + aiMax) / 2))}</Text>
            </View>
            <Text style={styles.exchangeNoticeText}>
              This estimated value is used by our exchange engine to calculate fair swaps and 10%
              tolerance top-up amounts when others propose trades.
            </Text>
          </View>
        )}

        {listingType === 'donate' && (
          <View style={styles.donateNoticeCard}>
            <View style={styles.donateNoticeHeader}>
              <MaterialCommunityIcons name="hand-heart" size={24} color={colors.donate} />
              <Text style={styles.donateNoticeTitle}>Claimable Only by Verified NGOs</Text>
            </View>
            <Text style={styles.donateNoticeText}>
              Verified charitable organizations (like Asha Kiran Trust) will be able to claim this
              item for their community programs. You will review and approve each request in your
              Inbox.
            </Text>
          </View>
        )}

        {/* City Field */}
        <View style={styles.formGroup}>
          <Text style={styles.formLabel}>City</Text>
          <TextInput
            style={styles.textInput}
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Chennai, Bengaluru, Mumbai"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Publish Action */}
        <Button
          label="Publish Listing"
          variant="primary"
          onPress={handlePublish}
          loading={publishing}
          icon={<MaterialCommunityIcons name="check" size={20} color={colors.white} />}
          style={{ marginTop: spacing.lg }}
        />
        <Button label="Back" variant="ghost" size="sm" onPress={() => setCurrentStep(3)} />
      </ScrollView>
    );
  };

  // ─── RENDER STEP 5: SUCCESS CELEBRATION ────────────────────────────────────

  const renderSuccess = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconCircle}>
        <MaterialCommunityIcons name="check-bold" size={48} color={colors.white} />
      </View>
      <Text style={styles.successTitle}>Item Listed Successfully!</Text>
      <Text style={styles.successSub}>
        Your item is now live and visible to everyone in {city || 'your city'}.
      </Text>

      {createdItem && (
        <View style={styles.successItemCard}>
          <ItemImage uri={createdItem.images[0]} category={createdItem.category} style={styles.successThumb} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.successItemTitle} numberOfLines={1}>
              {createdItem.title}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
              <TypeTag type={createdItem.listingType} />
              {createdItem.price ? (
                <PriceText amount={createdItem.price} size="sm" />
              ) : createdItem.listingType === 'donate' ? (
                <Text style={styles.freeText}>Free</Text>
              ) : (
                <Text style={styles.swapText}>Swap</Text>
              )}
            </View>
            <Text style={styles.successCityText}>{createdItem.city} • Just now</Text>
          </View>
        </View>
      )}

      <View style={styles.successActions}>
        {createdItem && (
          <Button
            label="View My Listing"
            variant="primary"
            onPress={() => router.replace(`/item/${createdItem.id}`)}
            style={{ width: '100%' }}
          />
        )}
        <Button
          label="Post Another Item"
          variant="secondary"
          onPress={handleResetForm}
          style={{ width: '100%' }}
        />
        <Button
          label="Back to Home Feed"
          variant="ghost"
          onPress={handleCloseOrHome}
        />
      </View>
    </View>
  );

  // ─── MAIN CONTAINER ───────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Header */}
        {currentStep <= 4 && (
          <View style={styles.header}>
            <Pressable
              onPress={handleCloseOrHome}
              style={styles.closeBtn}
              accessibilityLabel="Close post flow"
            >
              <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>Post an Item</Text>
            <View style={{ width: 40 }} />
          </View>
        )}

        {/* Stepper (Steps 1 to 4) */}
        {currentStep <= 4 && (
          <Stepper
            currentStep={currentStep}
            totalSteps={4}
            stepTitles={['Photos', 'AI Valuation', 'Details', 'Type & Price']}
          />
        )}

        {/* Main Content View */}
        <View style={styles.content}>
          {currentStep === 1 && renderStepPhotos()}
          {currentStep === 2 && renderStepAiAnalysis()}
          {currentStep === 3 && renderStepDetails()}
          {currentStep === 4 && renderStepTypeAndPrice()}
          {currentStep === 5 && renderSuccess()}
        </View>

        {/* Bottom Bar for Step 1 */}
        {currentStep === 1 && (
          <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <Button
              label={`Analyze with AI (${photos.length}/3)`}
              variant="primary"
              disabled={photos.length === 0}
              onPress={runAiAnalysis}
              icon={<MaterialCommunityIcons name="creation" size={18} color={colors.white} />}
              fullWidth
            />
          </View>
        )}
      </KeyboardAvoidingView>

      <Snackbar
        visible={!!toastMessage}
        message={toastMessage ?? ''}
        type={toastType}
        onDismiss={() => setToastMessage(null)}
      />
    </SafeAreaView>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────

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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.chip,
  },
  headerTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
  },
  stepScroll: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.md,
  },
  stepHeading: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  stepSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  /* Step 1: Photos */
  photoActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  photoSlot: {
    flex: 1,
    aspectRatio: 4 / 5,
    borderRadius: radius.card,
    overflow: 'hidden',
    position: 'relative',
    ...shadow.soft,
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  photoIndexBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoIndexText: {
    fontFamily: fontFamily.bold,
    fontSize: 11,
    color: colors.white,
  },
  addPhotoSlot: {
    flex: 1,
    aspectRatio: 4 / 5,
    borderRadius: radius.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addPhotoText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.primaryDark,
  },
  addPhotoSub: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  tipTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  tipText: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textSecondary,
    marginTop: 2,
  },

  /* Step 2: AI Analysis */
  aiLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  aiLoadingTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  aiLoadingSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  aiChecklist: {
    width: '100%',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.card,
    gap: spacing.md,
    ...shadow.soft,
  },
  aiCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  aiCheckText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  aiCheckTextActive: {
    color: colors.textPrimary,
    fontFamily: fontFamily.semiBold,
  },

  /* Flagged Screen */
  flaggedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  flaggedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.dangerBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  flaggedTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: colors.danger,
    textAlign: 'center',
  },
  flaggedReason: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: spacing.xs,
  },
  flaggedSub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  /* AI Success View */
  aiSuccessHeader: {
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  aiCheckCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiSuccessTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  aiSuccessSub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  aiDetectedCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aiDetectedHeader: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  aiDetectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aiDetectedLabel: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  aiDetectedVal: {
    fontFamily: fontFamily.semiBold,
    fontSize: 13,
    color: colors.textPrimary,
  },

  /* Step 3: Details */
  formGroup: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formLabel: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  aiBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.chip,
  },
  aiBadgeText: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.primaryDark,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.chip,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  categoryChipTextSelected: {
    fontFamily: fontFamily.bold,
    color: colors.primaryDark,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  conditionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 2,
  },
  conditionCardSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  conditionCardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  conditionCardTitleSelected: {
    color: colors.primaryDark,
  },
  conditionCardDesc: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF9E6',
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.exchangeBg,
    gap: spacing.sm,
  },
  hintTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.exchange,
  },
  hintText: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textPrimary,
    marginTop: 2,
  },

  /* Step 4: Type & Price */
  typeCardsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
    alignItems: 'center',
  },
  typeCardSelectedSell: {
    borderColor: colors.sell,
    backgroundColor: colors.sellBg,
  },
  typeCardSelectedExchange: {
    borderColor: colors.exchange,
    backgroundColor: colors.exchangeBg,
  },
  typeCardSelectedDonate: {
    borderColor: colors.donate,
    backgroundColor: colors.donateBg,
  },
  typeCardTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.textPrimary,
  },
  typeCardSub: {
    fontFamily: fontFamily.regular,
    fontSize: 10,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  priceSection: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.button,
    paddingHorizontal: spacing.md,
    height: 48,
    backgroundColor: colors.surface,
  },
  rupeePrefix: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.primaryDark,
    marginRight: spacing.xs,
  },
  priceInput: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  fairRangeBox: {
    backgroundColor: colors.primarySoft,
    padding: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  fairRangeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fairRangeTitle: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    color: colors.primaryDark,
  },
  fairRangeValues: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    color: colors.primaryDark,
  },
  rangeTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  rangeTargetZone: {
    height: '100%',
    width: '60%',
    marginLeft: '20%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  fairStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  fairStatusSuccess: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.primaryDark,
  },
  fairStatusWarning: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.exchange,
  },
  fairStatusGoodDeal: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.primaryDark,
  },
  exchangeNoticeCard: {
    backgroundColor: colors.exchangeBg,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.exchange,
    gap: spacing.xs,
  },
  exchangeNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  exchangeNoticeTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.exchange,
  },
  exchangeNoticeText: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textPrimary,
  },
  donateNoticeCard: {
    backgroundColor: colors.donateBg,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.donate,
    gap: spacing.xs,
  },
  donateNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  donateNoticeTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.donate,
  },
  donateNoticeText: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 17,
    color: colors.textPrimary,
  },

  /* Step 5: Success Screen */
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadow.soft,
  },
  successTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  successSub: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  successItemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
    width: '100%',
    marginVertical: spacing.md,
    ...shadow.soft,
  },
  successThumb: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
  },
  successItemTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  freeText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.donate,
  },
  swapText: {
    fontFamily: fontFamily.bold,
    fontSize: 13,
    color: colors.exchange,
  },
  successCityText: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  successActions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
    alignItems: 'center',
  },

  /* Bottom Bar */
  bottomBar: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
