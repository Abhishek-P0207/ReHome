/**
 * SkeletonCard — shimmering placeholder card while loading.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '@/theme/tokens';

function SkeletonBox({ style }: { style?: object }) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700 }),
        withTiming(0.4, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[{ backgroundColor: colors.skeleton }, style, animStyle]} />;
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonBox style={styles.image} />
      <View style={styles.info}>
        <SkeletonBox style={styles.tag} />
        <SkeletonBox style={styles.title} />
        <SkeletonBox style={styles.titleShort} />
        <SkeletonBox style={styles.price} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    flex: 1,
    margin: spacing.xs,
  },
  image: { aspectRatio: 4 / 5, borderRadius: 0 },
  info: { padding: spacing.md, gap: spacing.sm },
  tag: { height: 22, width: 56, borderRadius: radius.chip },
  title: { height: 16, borderRadius: 4, width: '90%' },
  titleShort: { height: 16, borderRadius: 4, width: '60%' },
  price: { height: 14, borderRadius: 4, width: 64 },
});
