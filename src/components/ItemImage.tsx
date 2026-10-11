/**
 * ItemImage — shows a local asset when one exists (mapped in services/mock/images.ts),
 * and otherwise shows a tasteful category-colored placeholder with a large category icon.
 */
import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { radius } from '@/theme/tokens';
import { getMockImage } from '@/services/mock/images';

// Category icon mapping
const categoryIcons: Record<string, string> = {
  Kitchen: 'pot-steam',
  Footwear: 'shoe-sneaker',
  Phones: 'cellphone',
  Furniture: 'desk',
  Books: 'book-open-variant',
  Music: 'music',
  Clothing: 'tshirt-crew',
  Home: 'home-variant',
  Electronics: 'laptop',
  default: 'package-variant',
};

// Category colors for placeholder backgrounds
const categoryColors: Record<string, { bg: string; icon: string }> = {
  Kitchen: { bg: '#E8F5E9', icon: '#2E7D32' },
  Footwear: { bg: '#E3F2FD', icon: '#1565C0' },
  Phones: { bg: '#F3E5F5', icon: '#7B1FA2' },
  Furniture: { bg: '#FFF3E0', icon: '#E65100' },
  Books: { bg: '#FFF8E1', icon: '#F57F17' },
  Music: { bg: '#FCE4EC', icon: '#C62828' },
  Clothing: { bg: '#E8EAF6', icon: '#283593' },
  Home: { bg: '#E0F7FA', icon: '#00838F' },
  Electronics: { bg: '#ECEFF1', icon: '#37474F' },
  default: { bg: '#F5F5F5', icon: '#757575' },
};

interface Props {
  uri?: string;
  category: string;
  style?: ViewStyle;
  size?: number;
  aspectRatio?: number;
}

export function ItemImage({
  uri,
  category,
  style,
  size,
  aspectRatio = 4 / 5,
}: Props) {
  const localSource = getMockImage(uri);
  const catColors = categoryColors[category] ?? categoryColors.default;
  const iconName = categoryIcons[category] ?? categoryIcons.default;
  const iconSize = size ? size * 0.4 : 48;

  const isRemoteOrFile =
    Boolean(uri && (uri.startsWith('http') || uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('data:') || uri.startsWith('blob:')));

  if (localSource || isRemoteOrFile) {
    return (
      <View
        style={[
          styles.container,
          { aspectRatio },
          size ? { width: size, height: undefined } : undefined,
          style,
        ]}
      >
        <Image
          source={localSource || { uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          accessibilityLabel={`${category} item image`}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: catColors.bg, aspectRatio },
        size ? { width: size, height: undefined } : undefined,
        style,
      ]}
      accessibilityLabel={`${category} item image`}
    >
      <MaterialCommunityIcons
        name={iconName as any}
        size={iconSize}
        color={catColors.icon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
});
