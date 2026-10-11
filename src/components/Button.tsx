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

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
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

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  style,
  accessibilityLabel,
}: Props) {
  const v = variantStyles[variant];
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
              { color: isDisabled ? colors.disabled : v.text },
              icon ? { marginLeft: spacing.sm } : undefined,
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
    height: 48,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.button,
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
    fontSize: 15,
    lineHeight: 22,
  },
});
