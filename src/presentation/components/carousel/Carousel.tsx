import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, FlatList, StyleSheet, ViewStyle, NativeSyntheticEvent, NativeScrollEvent, useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';

interface CarouselProps {
  data: React.ReactNode[];
  itemWidth?: number;
  gap?: number;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const CarouselDot = React.memo<{ active: boolean; activeColor: string; inactiveColor: string }>(
  ({ active, activeColor, inactiveColor }) => {
    const dotStyle = useMemo(() => [
      styles.dot,
      { backgroundColor: active ? activeColor : inactiveColor, width: active ? 20 : 8 },
    ], [active, activeColor, inactiveColor]);
    return <View style={dotStyle} />;
  },
);
CarouselDot.displayName = 'CarouselDot';

export const Carousel: React.FC<CarouselProps> = React.memo(({
  data,
  itemWidth: itemWidthProp,
  gap = 12,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 4000,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const userInteractingRef = useRef(false);

  const itemWidth = itemWidthProp ?? screenWidth - 48;
  const totalWidth = itemWidth + gap;

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / totalWidth);
    setActiveIndex(Math.max(0, Math.min(index, data.length - 1)));
  }, [totalWidth, data.length]);

  const stopAutoPlay = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    if (!autoPlay || data.length <= 1) return;
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      if (userInteractingRef.current) return;
      setActiveIndex(prev => {
        const next = (prev + 1) % data.length;
        flatListRef.current?.scrollToOffset({ offset: next * totalWidth, animated: true });
        return next;
      });
    }, autoPlayInterval);
  }, [autoPlay, autoPlayInterval, data.length, totalWidth, stopAutoPlay]);

  const handleScrollBeginDrag = useCallback(() => {
    userInteractingRef.current = true;
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleMomentumScrollEnd = useCallback(() => {
    userInteractingRef.current = false;
    startAutoPlay();
  }, [startAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return stopAutoPlay;
  }, [startAutoPlay, stopAutoPlay]);

  const dotActive = theme.colors.primary;
  const dotInactive = theme.colors.outlineVariant;

  const snapOffsets = useMemo(() => {
    return data.map((_, i) => i * totalWidth);
  }, [data, totalWidth]);

  const contentPadding = useMemo(() => ({
    paddingHorizontal: (screenWidth - itemWidth) / 2 - gap / 2,
  }), [screenWidth, itemWidth, gap]);

  const itemStyle = useMemo(() => ({
    width: itemWidth,
    marginHorizontal: gap / 2,
  }), [itemWidth, gap]);

  const renderItem = useCallback(({ item }: { item: React.ReactNode }) => (
    <View style={itemStyle}>
      {item}
    </View>
  ), [itemStyle]);

  const keyExtractor = useCallback((_: React.ReactNode, index: number) => `carousel-${index}`, []);

  const getItemLayout = useCallback((_: unknown, index: number) => ({
    length: totalWidth,
    offset: totalWidth * index,
    index,
  }), [totalWidth]);

  return (
    <View style={style} testID={testID} accessibilityLabel={accessibilityLabel || 'Carrusel'}>
      <FlatList
        ref={flatListRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToOffsets={snapOffsets}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={contentPadding}
        getItemLayout={getItemLayout}
      />

      {showDots && data.length > 1 ? (
        <View style={styles.dotsRow}>
          {data.map((_, index) => (
            <CarouselDot
              key={index}
              active={index === activeIndex}
              activeColor={dotActive}
              inactiveColor={dotInactive}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
});
Carousel.displayName = 'Carousel';

const styles = StyleSheet.create({
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});
