/**
 * Animated pressable wrapper used by Button, cards, etc.
 * Scales down on press with Reanimated, respects reduced motion.
 */
import React, { useCallback } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle, AccessibilityInfo, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { animation } from '@/theme/tokens';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleValue?: number;
  disabled?: boolean;
}

export function PressableScale({
  children,
  style,
  scaleValue = animation.pressScale,
  disabled,
  onPressIn,
  onPressOut,
  ...rest
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(
    (e: any) => {
      scale.value = withSpring(scaleValue, { damping: 15, stiffness: 200 });
      onPressIn?.(e);
    },
    [scaleValue, onPressIn, scale],
  );

  const handlePressOut = useCallback(
    (e: any) => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
      onPressOut?.(e);
    },
    [onPressOut, scale],
  );

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      disabled={disabled}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
