/**
 * React Native Paper (Material 3) custom theme for ReHome.
 * Uses design tokens so every component inherits the right palette.
 */
import { MD3LightTheme, configureFonts } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import { colors, fontFamily } from './tokens';

const fontConfig = {
  displayLarge: { fontFamily: fontFamily.bold, fontSize: 28, lineHeight: 34, letterSpacing: 0 },
  displayMedium: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30, letterSpacing: 0 },
  displaySmall: { fontFamily: fontFamily.bold, fontSize: 22, lineHeight: 28, letterSpacing: 0 },
  headlineLarge: { fontFamily: fontFamily.semiBold, fontSize: 22, lineHeight: 28, letterSpacing: 0 },
  headlineMedium: { fontFamily: fontFamily.semiBold, fontSize: 20, lineHeight: 26, letterSpacing: 0 },
  headlineSmall: { fontFamily: fontFamily.semiBold, fontSize: 18, lineHeight: 24, letterSpacing: 0 },
  titleLarge: { fontFamily: fontFamily.semiBold, fontSize: 22, lineHeight: 28, letterSpacing: 0 },
  titleMedium: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 22, letterSpacing: 0.15 },
  titleSmall: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  bodyLarge: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24, letterSpacing: 0.15 },
  bodyMedium: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 22, letterSpacing: 0.25 },
  bodySmall: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18, letterSpacing: 0.4 },
  labelLarge: { fontFamily: fontFamily.medium, fontSize: 14, lineHeight: 20, letterSpacing: 0.1 },
  labelMedium: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.5 },
  labelSmall: { fontFamily: fontFamily.medium, fontSize: 11, lineHeight: 16, letterSpacing: 0.5 },
} as const;

export const theme: MD3Theme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    onPrimary: colors.white,
    primaryContainer: colors.primarySoft,
    onPrimaryContainer: colors.primaryDark,
    secondary: colors.exchange,
    onSecondary: colors.white,
    secondaryContainer: colors.exchangeBg,
    onSecondaryContainer: colors.exchange,
    tertiary: colors.donate,
    onTertiary: colors.white,
    tertiaryContainer: colors.donateBg,
    onTertiaryContainer: colors.donate,
    background: colors.background,
    onBackground: colors.textPrimary,
    surface: colors.surface,
    onSurface: colors.textPrimary,
    surfaceVariant: colors.background,
    onSurfaceVariant: colors.textSecondary,
    outline: colors.border,
    outlineVariant: colors.border,
    error: colors.danger,
    onError: colors.white,
    errorContainer: colors.dangerBg,
    onErrorContainer: colors.danger,
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  fonts: configureFonts({ config: fontConfig }),
  roundness: 14,
};
