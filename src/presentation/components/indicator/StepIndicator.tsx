import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface StepIndicatorProps {
  total: number;
  current: number;
  variant?: 'dots' | 'bar';
  showLabel?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = React.memo(({
  total,
  current,
  variant = 'dots',
  showLabel = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const activeColor = theme.colors.primary;
  const inactiveColor = theme.colors.outlineVariant;
  const labelColor = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  const progress = useMemo(() =>
    Math.min(Math.max(current / total, 0), 1),
    [current, total]
  );

  if (variant === 'bar') {
    return (
      <View style={[styles.barContainer, style]} testID={testID} accessibilityLabel={accessibilityLabel || `Paso ${current} de ${total}`}>
        <View style={[styles.barTrack, { backgroundColor: inactiveColor }]}>
          <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: activeColor }]} />
        </View>
        {showLabel ? (
          <Text variant="labelSmall" style={labelColor}>{current} / {total}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.dotsContainer, style]} testID={testID} accessibilityLabel={accessibilityLabel || `Paso ${current} de ${total}`}>
      <View style={styles.dotsRow}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < current ? activeColor : inactiveColor,
                width: i === current - 1 ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>
      {showLabel ? (
        <Text variant="labelSmall" style={labelColor}>{current} / {total}</Text>
      ) : null}
    </View>
  );
});
StepIndicator.displayName = 'StepIndicator';

const styles = StyleSheet.create({
  dotsContainer: {
    alignItems: 'center',
    gap: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  barContainer: {
    gap: 8,
    alignItems: 'center',
  },
  barTrack: {
    height: 4,
    borderRadius: 2,
    width: '100%',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});
