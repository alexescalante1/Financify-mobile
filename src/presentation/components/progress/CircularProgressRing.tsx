import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { AppTheme } from '@/presentation/theme/materialTheme';

type RingSize = 'sm' | 'md' | 'lg' | 'xl';

const SIZE_CONFIG: Record<RingSize, { diameter: number; strokeWidth: number; textVariant: 'labelSmall' | 'bodySmall' | 'bodyMedium' | 'titleMedium' }> = {
  sm: { diameter: 48, strokeWidth: 4, textVariant: 'labelSmall' },
  md: { diameter: 72, strokeWidth: 5, textVariant: 'bodySmall' },
  lg: { diameter: 100, strokeWidth: 6, textVariant: 'bodyMedium' },
  xl: { diameter: 140, strokeWidth: 8, textVariant: 'titleMedium' },
};

interface CircularProgressRingProps {
  progress: number;
  size?: RingSize;
  color?: string;
  trackColor?: string;
  showPercentage?: boolean;
  label?: string;
  centerContent?: React.ReactNode;
  animated?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const CircularProgressRing: React.FC<CircularProgressRingProps> = React.memo(({
  progress,
  size = 'md',
  color,
  trackColor,
  showPercentage = true,
  label,
  centerContent,
  animated = true,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];
  const config = SIZE_CONFIG[size];
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const ringColor = color || colors.success;
  const ringTrackColor = trackColor || theme.colors.surfaceVariant;

  useEffect(() => {
    if (animated) {
      const anim = Animated.timing(animatedProgress, {
        toValue: clampedProgress,
        duration: 600,
        useNativeDriver: false,
      });
      anim.start();
      return () => anim.stop();
    } else {
      animatedProgress.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animatedProgress]);

  // We use a View-based ring (two half-circles technique) since RN doesn't have SVG built-in
  const percentText = `${Math.round(clampedProgress * 100)}%`;

  const containerStyle = useMemo(() => ({
    width: config.diameter,
    height: config.diameter,
  }), [config.diameter]);

  const baseRingStyle = useMemo(() => ({
    width: config.diameter,
    height: config.diameter,
    borderRadius: config.diameter / 2,
    borderWidth: config.strokeWidth,
    borderColor: ringTrackColor,
  }), [config.diameter, config.strokeWidth, ringTrackColor]);

  // Progress ring using the "two halves" technique
  const halfSize = config.diameter / 2;

  // Use animatedProgress interpolation so the `animated` prop actually drives the visual
  const rightHalfRotation = animatedProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '180deg', '180deg'],
    extrapolate: 'clamp',
  });

  const leftHalfRotation = animatedProgress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '0deg', '180deg'],
    extrapolate: 'clamp',
  });

  const leftHalfOpacity = animatedProgress.interpolate({
    inputRange: [0, 0.499, 0.5, 1],
    outputRange: [0, 0, 1, 1],
    extrapolate: 'clamp',
  });

  const halfClipStyle = useMemo(() => ({
    width: halfSize,
    height: config.diameter,
    overflow: 'hidden' as const,
  }), [halfSize, config.diameter]);

  const halfRingBase = useMemo(() => ({
    width: config.diameter,
    height: config.diameter,
    borderRadius: config.diameter / 2,
    borderWidth: config.strokeWidth,
    borderColor: ringColor,
  }), [config.diameter, config.strokeWidth, ringColor]);

  const labelStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  const percentStyle = useMemo(() => ({
    color: theme.colors.onSurface,
    fontWeight: '700' as const,
  }), [theme.colors.onSurface]);

  return (
    <View
      style={[styles.wrapper, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `Progreso: ${percentText}`}
    >
      <View style={[styles.container, containerStyle]}>
        {/* Track ring */}
        <View style={[styles.absoluteFill, baseRingStyle]} />

        {/* Right half of progress */}
        <View style={[styles.absoluteFill, styles.row]}>
          {/* Right clip */}
          <View style={{ width: halfSize }} />
          <View style={halfClipStyle}>
            <Animated.View
              style={[
                halfRingBase,
                {
                  position: 'absolute',
                  right: 0,
                  borderLeftColor: 'transparent',
                  borderBottomColor: 'transparent',
                  transform: [{ rotate: rightHalfRotation }],
                },
              ]}
            />
          </View>
        </View>

        {/* Left half of progress — opacity driven by animatedProgress */}
        <Animated.View style={[styles.absoluteFill, styles.row, { opacity: leftHalfOpacity }]}>
          <View style={halfClipStyle}>
            <Animated.View
              style={[
                halfRingBase,
                {
                  position: 'absolute',
                  left: 0,
                  borderRightColor: 'transparent',
                  borderTopColor: 'transparent',
                  transform: [{ rotate: leftHalfRotation }],
                },
              ]}
            />
          </View>
        </Animated.View>

        {/* Center content */}
        <View style={styles.centerContent}>
          {centerContent || (
            <>
              {showPercentage && (
                <Text variant={config.textVariant} style={percentStyle}>
                  {percentText}
                </Text>
              )}
            </>
          )}
        </View>
      </View>

      {label && (
        <Text variant="bodySmall" style={[styles.label, labelStyle]} numberOfLines={1}>
          {label}
        </Text>
      )}
    </View>
  );
});
CircularProgressRing.displayName = 'CircularProgressRing';

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    position: 'relative',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  row: {
    flexDirection: 'row',
  },
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginTop: 6,
    textAlign: 'center',
  },
});
