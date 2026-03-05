import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, Animated, LayoutChangeEvent } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface Segment {
  key: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selected: string;
  onSelect: (key: string) => void;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = React.memo(({
  segments,
  selected,
  onSelect,
  size = 'md',
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const springRef = useRef<Animated.CompositeAnimation | null>(null);
  const segmentWidths = useRef<number[]>([]);
  const segmentPositions = useRef<number[]>([]);
  const containerWidth = useRef(0);
  const isInitialized = useRef(false);

  const selectedIndex = useMemo(() => {
    return segments.findIndex(s => s.key === selected);
  }, [segments, selected]);

  const animateIndicator = useCallback((index: number, animate: boolean) => {
    if (segmentWidths.current.length === 0 || index < 0) return;
    const targetX = segmentPositions.current[index] || 0;

    springRef.current?.stop();
    if (animate) {
      springRef.current = Animated.spring(indicatorPosition, {
        toValue: targetX,
        useNativeDriver: true,
        tension: 300,
        friction: 25,
      });
      springRef.current.start();
    } else {
      indicatorPosition.setValue(targetX);
    }
  }, [indicatorPosition]);

  useEffect(() => {
    animateIndicator(selectedIndex, isInitialized.current);
    isInitialized.current = true;
    return () => springRef.current?.stop();
  }, [selectedIndex, animateIndicator]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    containerWidth.current = event.nativeEvent.layout.width;
    const count = segments.length;
    if (count === 0) return;
    const padding = 3;
    const availableWidth = event.nativeEvent.layout.width - padding * 2;
    const segWidth = availableWidth / count;

    segmentWidths.current = Array(count).fill(segWidth);
    segmentPositions.current = Array.from({ length: count }, (_, i) => i * segWidth);

    animateIndicator(selectedIndex, false);
  }, [segments.length, selectedIndex, animateIndicator]);

  const handleSelect = useCallback((key: string) => {
    onSelect(key);
  }, [onSelect]);

  const containerStyle = useMemo(() => ({
    backgroundColor: theme.colors.surfaceVariant,
  }), [theme.colors.surfaceVariant]);

  const activeTextColor = useMemo(() => theme.colors.onPrimary, [theme.colors.onPrimary]);
  const inactiveTextColor = useMemo(() => theme.colors.onSurfaceVariant, [theme.colors.onSurfaceVariant]);

  const indicatorStyle = useMemo(() => ({
    backgroundColor: theme.colors.primary,
    width: segments.length > 0 ? `${100 / segments.length}%` as unknown as number : 0,
    transform: [{ translateX: indicatorPosition }],
  }), [theme.colors.primary, segments.length, indicatorPosition]);

  const sizeConfig = useMemo(() => {
    if (size === 'sm') return { paddingVertical: 5, variant: 'labelMedium' as const };
    if (size === 'lg') return { paddingVertical: 12, variant: 'titleSmall' as const };
    return { paddingVertical: 8, variant: 'labelLarge' as const };
  }, [size]);

  const segmentPaddingStyle = useMemo(
    () => ({ paddingVertical: sizeConfig.paddingVertical }),
    [sizeConfig.paddingVertical],
  );

  return (
    <View
      style={[styles.container, containerStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tablist"
      onLayout={handleLayout}
    >
      <Animated.View
        style={[styles.indicator, indicatorStyle]}
      />

      {segments.map((segment) => {
        const isActive = segment.key === selected;
        return (
          <Pressable
            key={segment.key}
            onPress={() => handleSelect(segment.key)}
            style={[styles.segment, segmentPaddingStyle]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={segment.label}
          >
            <Text
              variant={sizeConfig.variant}
              style={[
                styles.segmentText,
                { color: isActive ? activeTextColor : inactiveTextColor },
              ]}
              numberOfLines={1}
            >
              {segment.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});
SegmentedControl.displayName = 'SegmentedControl';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    left: 3,
    borderRadius: 8,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    zIndex: 1,
  },
  segmentText: {
    fontWeight: '600',
  },
});
