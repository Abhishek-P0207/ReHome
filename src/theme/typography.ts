/**
 * Typography helper styles for use in components.
 * Provides pre-built text style objects from design tokens.
 */
import { StyleSheet } from 'react-native';
import { typography, colors, fontFamily } from './tokens';

export const textStyles = StyleSheet.create({
  display: {
    ...typography.display,
    color: colors.textPrimary,
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
  },
  heading: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textPrimary,
  },
  bodySecondary: {
    ...typography.body,
    color: colors.textSecondary,
  },
  caption: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  labelPrimary: {
    ...typography.label,
    color: colors.primary,
  },
});

export { fontFamily };
