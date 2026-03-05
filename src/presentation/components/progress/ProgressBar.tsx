import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  trackColor?: string;
  height?: number;
  animated?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = React.memo(({
  progress,
  label,
  showPercentage = true,
  color,
  trackColor,
  height = 8,
  animated = true,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  const clampedProgress = Math.min(1, Math.max(0, progress));
  const fillColor = color || theme.colors.primary;
  const bgColor = trackColor || theme.colors.surfaceVariant;
  const percentage = Math.round(clampedProgress * 100);

  useEffect(() => {
    if (animated) {
      const anim = Animated.timing(animatedProgress, {
        toValue: clampedProgress,
        duration: 500,
        useNativeDriver: false,
      });
      anim.start();
      return () => anim.stop();
    } else {
      animatedProgress.setValue(clampedProgress);
    }
  }, [clampedProgress, animated, animatedProgress]);

  const trackStyle = useMemo(() => ({
    height,
    borderRadius: height / 2,
    backgroundColor: bgColor,
    overflow: 'hidden' as const,
  }), [height, bgColor]);

  const fillStyle = useMemo(() => ({
    height: '100%' as const,
    backgroundColor: fillColor,
    borderRadius: height / 2,
  }), [fillColor, height]);

  return (
    <View
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `${label || 'Progreso'}: ${percentage}%`}
      accessibilityRole="progressbar"
    >
      {(label || showPercentage) && (
        <View style={styles.labelRow}>
          {label ? (
            <Text variant="bodySmall" style={styles.label}>
              {label}
            </Text>
          ) : null}
          {showPercentage ? (
            <Text variant="bodySmall" style={styles.percentage}>
              {percentage}%
            </Text>
          ) : null}
        </View>
      )}
      <View style={trackStyle}>
        <Animated.View style={[fillStyle, { width: animatedProgress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      </View>
    </View>
  );
});

ProgressBar.displayName = 'ProgressBar';

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    flex: 1,
  },
  percentage: {
    fontWeight: '600',
  },
});
