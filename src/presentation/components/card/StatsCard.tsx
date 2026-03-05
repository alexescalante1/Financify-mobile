import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleCard } from '@/presentation/components/card/SimpleCard';
import { SkeletonLoader } from '@/presentation/components/skeleton/SkeletonLoader';
import type { CardVariant, CardBorderStyle } from '@/presentation/components/card/cardConstants';
import type { AppTheme } from '@/presentation/theme/materialTheme';

type TrendDirection = 'up' | 'down' | 'neutral';

interface StatsCardProps {
  title: string;
  value: string;
  icon?: string;
  trend?: {
    direction: TrendDirection;
    value: string;
    label?: string;
  };
  loading?: boolean;
  variant?: CardVariant;
  borderStyle?: CardBorderStyle;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const TREND_ICONS: Record<TrendDirection, string> = {
  up: 'arrow-up-bold',
  down: 'arrow-down-bold',
  neutral: 'minus',
};

export const StatsCard: React.FC<StatsCardProps> = React.memo(({
  title,
  value,
  icon,
  trend,
  loading = false,
  variant = 'default',
  borderStyle = 'elegant',
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];

  const trendColor = useMemo(() => {
    if (!trend) return undefined;
    const colorMap: Record<TrendDirection, string> = {
      up: colors.success,
      down: colors.error,
      neutral: colors.neutral,
    };
    return colorMap[trend.direction];
  }, [trend, colors.success, colors.error, colors.neutral]);

  const trendValueStyle = useMemo(() => ({
    color: trendColor,
    fontWeight: '600' as const,
  }), [trendColor]);

  const trendLabelStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
    marginLeft: 4,
  }), [theme.colors.onSurfaceVariant]);

  if (loading) {
    return (
      <SimpleCard
        variant={variant}
        borderStyle={borderStyle}
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel || 'Cargando estadística'}
      >
        <View style={styles.header}>
          <SkeletonLoader width={80} height={14} borderRadius={4} />
          {icon ? <SkeletonLoader width={20} height={20} borderRadius={10} /> : null}
        </View>
        <SkeletonLoader width={120} height={28} borderRadius={4} style={styles.valueSkeleton} />
        <SkeletonLoader width={100} height={14} borderRadius={4} style={styles.trendSkeleton} />
      </SimpleCard>
    );
  }

  return (
    <SimpleCard
      variant={variant}
      borderStyle={borderStyle}
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.header}>
        <Text variant="bodySmall" style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {icon ? (
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={20}
            color={theme.colors.onSurfaceVariant}
          />
        ) : null}
      </View>

      <Text variant="headlineMedium" style={styles.value}>
        {value}
      </Text>

      {trend ? (
        <View style={styles.trendRow}>
          <MaterialCommunityIcons
            name={TREND_ICONS[trend.direction] as keyof typeof MaterialCommunityIcons.glyphMap}
            size={16}
            color={trendColor}
          />
          <Text variant="bodySmall" style={trendValueStyle}>
            {trend.value}
          </Text>
          {trend.label ? (
            <Text variant="bodySmall" style={trendLabelStyle}>
              {trend.label}
            </Text>
          ) : null}
        </View>
      ) : null}
    </SimpleCard>
  );
});
StatsCard.displayName = 'StatsCard';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    opacity: 0.8,
  },
  value: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  valueSkeleton: {
    marginBottom: 4,
  },
  trendSkeleton: {
    marginTop: 4,
  },
});
