/**
 * ReHome Design Tokens
 * All colors, spacing, typography, and shape values used throughout the app.
 * No hardcoded values in screens — always import from here.
 */

// ─── Color Tokens ───────────────────────────────────────────────────────────

export const colors = {
  primary: '#1F9D7A',
  primaryDark: '#0F6E56',
  primarySoft: '#E1F5EE',

  background: '#F7F8F6',
  surface: '#FFFFFF',

  textPrimary: '#17211D',
  textSecondary: '#5B6B64',

  border: '#E3E8E5',

  // Listing type colors
  sell: '#1F9D7A',
  sellBg: '#E1F5EE',
  exchange: '#B7660B',
  exchangeBg: '#FDF1DC',
  donate: '#B0306A',
  donateBg: '#FCE8F1',

  // Status colors
  success: '#2E7D32',
  warning: '#B7660B',
  danger: '#C62828',
  dangerBg: '#FDECEC',

  // Misc
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.4)',
  skeleton: '#E8EDEA',
  skeletonHighlight: '#F2F5F3',

  // Disabled
  disabled: '#B8C4BE',
  disabledBg: '#EEF1EF',
} as const;

// ─── Listing Type Token Map ─────────────────────────────────────────────────

export const listingTypeColors = {
  sell: { text: colors.sell, bg: colors.sellBg },
  exchange: { text: colors.exchange, bg: colors.exchangeBg },
  donate: { text: colors.donate, bg: colors.donateBg },
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

export const fontFamily = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

export const typography = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    lineHeight: 34,
  },
  title: {
    fontFamily: fontFamily.semiBold,
    fontSize: 22,
    lineHeight: 28,
  },
  heading: {
    fontFamily: fontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
} as const;

// ─── Spacing (8-point grid) ─────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// ─── Shape ──────────────────────────────────────────────────────────────────

export const radius = {
  sm: 8,
  md: 12,
  card: 16,
  button: 14,
  chip: 999,
  sheet: 24,
} as const;

// ─── Elevation / Shadow ─────────────────────────────────────────────────────

export const shadow = {
  soft: {
    shadowColor: '#17211D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#17211D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

// ─── Animation ──────────────────────────────────────────────────────────────

export const animation = {
  pressScale: 0.97,
  staggerDelay: 80, // ms between staggered items
  maxStaggerItems: 8,
  springConfig: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
} as const;

// ─── Layout ─────────────────────────────────────────────────────────────────

export const layout = {
  screenPadding: spacing.lg,
  cardGap: spacing.md,
  minTouchTarget: 44,
} as const;
