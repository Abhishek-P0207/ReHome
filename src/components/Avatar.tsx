/**
 * Avatar — displays user initials on a colored background.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { fontFamily } from '@/theme/tokens';

interface Props {
  name: string;
  color: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name, color, size = 40 }: Props) {
  const fontSize = size * 0.4;
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}
      accessibilityLabel={`Avatar for ${name}`}
    >
      <Text
        style={[
          styles.initials,
          { fontSize, lineHeight: fontSize * 1.2 },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: fontFamily.semiBold,
    color: '#FFFFFF',
  },
});
