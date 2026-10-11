/**
 * FilterChips — single-select, horizontally scrollable chip row.
 * Fixed height and centered alignment to prevent vertical stretching across all platforms.
 */
import React from 'react';
import { StyleSheet, ScrollView, Pressable, View, type ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, fontFamily, spacing, radius } from '@/theme/tokens';

interface Chip {
  key: string;
  label: string;
}

interface Props {
  chips: Chip[];
  selected: string;
  onSelect: (key: string) => void;
  style?: ViewStyle;
}

export function FilterChips({ chips, selected, onSelect, style }: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
        style={styles.scroll}
      >
        {chips.map((chip) => {
          const isActive = chip.key === selected;
          return (
            <Pressable
              key={chip.key}
              onPress={() => onSelect(chip.key)}
              accessibilityLabel={`Filter by ${chip.label}`}
              accessibilityState={{ selected: isActive }}
              style={[
                styles.chip,
                isActive ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.label,
                  isActive ? styles.labelActive : styles.labelInactive,
                ]}
              >
                {chip.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 48,
    justifyContent: 'center',
    flexShrink: 0,
  },
  scroll: {
    flexGrow: 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    height: 36,
    borderRadius: radius.chip,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipInactive: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.white,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});
