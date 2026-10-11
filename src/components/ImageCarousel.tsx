/**
 * ImageCarousel — swipeable image carousel with dot indicators.
 */
import React, { useState, useCallback, useRef } from 'react';
import { StyleSheet, View, FlatList, Dimensions, type ViewToken } from 'react-native';
import { colors, radius, spacing } from '@/theme/tokens';
import { ItemImage } from './ItemImage';

interface Props {
  images: string[];
  category: string;
  height?: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function ImageCarousel({ images, category, height = 360 }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const displayImages = images.length > 0 ? images : ['placeholder'];

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={[styles.container, { height }]}>
      <FlatList
        data={displayImages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={{ width: SCREEN_WIDTH, height }}>
            <ItemImage
              uri={item === 'placeholder' ? undefined : item}
              category={category}
              style={{ borderRadius: 0, height: '100%', aspectRatio: undefined }}
            />
          </View>
        )}
      />
      {displayImages.length > 1 && (
        <View style={styles.dots}>
          {displayImages.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === activeIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 24,
  },
});
