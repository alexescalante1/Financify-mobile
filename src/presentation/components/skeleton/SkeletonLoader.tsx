import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type SkeletonVariant = 'text' | 'title' | 'avatar' | 'card' | 'custom';

type DimensionValue = number | `${number}%` | 'auto';

const VARIANT_DEFAULTS: Record<SkeletonVariant, { width: DimensionValue; height: number; borderRadius: number }> = {
  text: { width: '100%', height: 14, borderRadius: 4 },
  title: { width: '60%', height: 20, borderRadius: 4 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  card: { width: '100%', height: 120, borderRadius: 8 },
  custom: { width: '100%', height: 20, borderRadius: 4 },
};

interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  count?: number;
  gap?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = React.memo(({
  variant = 'text',
  width,
  height,
  borderRadius,
  count = 1,
  gap = 8,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const defaults = VARIANT_DEFAULTS[variant];
  const resolvedWidth = width ?? defaults.width;
  const resolvedHeight = height ?? defaults.height;
  const resolvedRadius = borderRadius ?? defaults.borderRadius;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  const skeletonStyle = useMemo(() => ({
    width: resolvedWidth,
    height: resolvedHeight,
    borderRadius: resolvedRadius,
    backgroundColor: theme.colors.surfaceVariant,
    opacity: opacityAnim,
  }), [resolvedWidth, resolvedHeight, resolvedRadius, theme.colors.surfaceVariant, opacityAnim]);

  const items = useMemo(() => Array.from({ length: count }, (_, i) => i), [count]);

  if (count === 1) {
    return (
      <Animated.View
        style={[skeletonStyle, style]}
        testID={testID}
        accessibilityLabel={accessibilityLabel || 'Cargando...'}
      />
    );
  }

  return (
    <View style={[containerStyles.wrapper, { gap }, style]} testID={testID} accessibilityLabel={accessibilityLabel || 'Cargando...'}>
      {items.map(i => (
        <Animated.View key={i} style={skeletonStyle} />
      ))}
    </View>
  );
});
SkeletonLoader.displayName = 'SkeletonLoader';

const containerStyles = StyleSheet.create({
  wrapper: {},
});
