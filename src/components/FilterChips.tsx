/**
 * FilterChips — single-select, horizontally scrollable chip row.
 */
import React from 'react';
import { StyleSheet, ScrollView, Pressable, View } from 'react-native';
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
}

export function FilterChips({ chips, selected, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.chip,
    minHeight: 36,
    justifyContent: 'center',
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
  },
  labelActive: {
    color: colors.white,
  },
  labelInactive: {
    color: colors.textSecondary,
  },
});
