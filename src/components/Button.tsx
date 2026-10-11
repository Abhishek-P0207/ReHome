/**
 * Button component with primary, secondary, ghost, and danger variants.
 * Supports loading and disabled states with haptic feedback on press.
 */
import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, radius, spacing, fontFamily } from '@/theme/tokens';
import { PressableScale } from './PressableScale';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
  primary: { bg: colors.primary, text: colors.white },
  secondary: { bg: colors.primarySoft, text: colors.primaryDark },
  ghost: { bg: 'transparent', text: colors.primary },
  danger: { bg: colors.danger, text: colors.white },
};

const sizeStyles: Record<Size, { height: number; paddingHorizontal: number; borderRadius: number; fontSize: number; lineHeight: number }> = {
  sm: {
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  md: {
    height: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.button,
    fontSize: 14,
    lineHeight: 20,
  },
  lg: {
    height: 50,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
    fontSize: 16,
    lineHeight: 24,
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  accessibilityLabel,
}: Props) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.paddingHorizontal,
          borderRadius: s.borderRadius,
          backgroundColor: isDisabled ? colors.disabledBg : v.bg,
          borderColor: variant === 'ghost' ? 'transparent' : undefined,
        },
        variant === 'secondary' ? styles.secondaryBorder : undefined,
        fullWidth ? styles.fullWidth : undefined,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isDisabled ? colors.disabled : v.text}
          size="small"
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              {
                fontSize: s.fontSize,
                lineHeight: s.lineHeight,
                color: isDisabled ? colors.disabled : v.text,
              },
              icon ? { marginLeft: spacing.xs } : undefined,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontFamily: fontFamily.semiBold,
  },
});
