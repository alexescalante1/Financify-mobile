import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/presentation/theme/materialTheme';
import { withAlpha } from '@/presentation/theme/colorUtils';

type BadgeSize = 'sm' | 'md' | 'lg';

interface PercentageBadgeProps {
  value: number;
  showIcon?: boolean;
  showSign?: boolean;
  decimals?: number;
  size?: BadgeSize;
  neutralThreshold?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const SIZE_CONFIG: Record<BadgeSize, { fontSize: 'labelSmall' | 'bodySmall' | 'bodyMedium'; iconSize: number; paddingH: number; paddingV: number; borderRadius: number }> = {
  sm: { fontSize: 'labelSmall', iconSize: 10, paddingH: 6, paddingV: 2, borderRadius: 8 },
  md: { fontSize: 'bodySmall', iconSize: 12, paddingH: 8, paddingV: 2, borderRadius: 8 },
  lg: { fontSize: 'bodyMedium', iconSize: 14, paddingH: 12, paddingV: 4, borderRadius: 8 },
};

export const PercentageBadge: React.FC<PercentageBadgeProps> = React.memo(({
  value,
  showIcon = true,
  showSign = true,
  decimals = 1,
  size = 'md',
  neutralThreshold = 0.01,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];
  const config = SIZE_CONFIG[size];

  const direction = useMemo(() => {
    if (Math.abs(value) < neutralThreshold) return 'neutral' as const;
    return value > 0 ? 'up' as const : 'down' as const;
  }, [value, neutralThreshold]);

  const badgeColor = useMemo(() => {
    const colorMap = {
      up: colors.profit,
      down: colors.loss,
      neutral: colors.neutral,
    };
    return colorMap[direction];
  }, [direction, colors.profit, colors.loss, colors.neutral]);

  const formattedValue = useMemo(() => {
    const abs = Math.abs(value).toFixed(decimals);
    const sign = showSign && value > 0 ? '+' : showSign && value < 0 ? '-' : '';
    return `${sign}${abs}%`;
  }, [value, decimals, showSign]);

  const iconName = useMemo(() => {
    if (direction === 'up') return 'arrow-up-bold';
    if (direction === 'down') return 'arrow-down-bold';
    return 'minus';
  }, [direction]);

  const containerStyle = useMemo(() => ({
    backgroundColor: withAlpha(badgeColor, 0.09),
    paddingHorizontal: config.paddingH,
    paddingVertical: config.paddingV,
    borderRadius: config.borderRadius,
  }), [badgeColor, config.paddingH, config.paddingV, config.borderRadius]);

  const textStyle = useMemo(() => ({
    color: badgeColor,
    fontWeight: '700' as const,
  }), [badgeColor]);

  return (
    <View
      style={[styles.container, containerStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `${formattedValue}`}
    >
      {showIcon && (
        <MaterialCommunityIcons
          name={iconName as keyof typeof MaterialCommunityIcons.glyphMap}
          size={config.iconSize}
          color={badgeColor}
        />
      )}
      <Text variant={config.fontSize} style={textStyle}>
        {formattedValue}
      </Text>
    </View>
  );
});
PercentageBadge.displayName = 'PercentageBadge';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
});
