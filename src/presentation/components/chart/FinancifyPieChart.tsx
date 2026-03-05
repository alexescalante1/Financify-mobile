import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { PieChart, pieDataItem } from 'react-native-gifted-charts';
import type { AppTheme } from '@/presentation/theme/materialTheme';

const CHART_PALETTE = [
  '#00BEFF', '#00D18F', '#8B5CF6', '#FF2A5F',
  '#FFBE0B', '#06B6D4', '#F97316', '#10B981',
];

interface FinancifyPieChartProps {
  data: pieDataItem[];
  donut?: boolean;
  radius?: number;
  innerRadius?: number;
  showText?: boolean;
  centerLabel?: string;
  centerSubLabel?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const FinancifyPieChart: React.FC<FinancifyPieChartProps> = React.memo(({
  data,
  donut = false,
  radius = 100,
  innerRadius = 60,
  showText = true,
  centerLabel,
  centerSubLabel,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];

  const themedData = useMemo(() =>
    data.map((item, index) => ({
      ...item,
      color: item.color || CHART_PALETTE[index % CHART_PALETTE.length],
      textColor: item.textColor || colors.onSurface,
      textSize: item.textSize || 11,
    })),
    [data, colors.onSurface]
  );

  const centerLabelComponent = useMemo(() => {
    if (!centerLabel) return undefined;
    return () => (
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Text variant="titleMedium" style={{ color: colors.onSurface, fontWeight: '700' }}>
          {centerLabel}
        </Text>
        {centerSubLabel ? (
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {centerSubLabel}
          </Text>
        ) : null}
      </View>
    );
  }, [centerLabel, centerSubLabel, colors.onSurface, colors.onSurfaceVariant]);

  return (
    <View
      style={[{ alignItems: 'center' }, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || 'Gráfico circular'}
    >
      <PieChart
        data={themedData}
        donut={donut}
        radius={radius}
        innerRadius={donut ? innerRadius : undefined}
        showText={showText}
        innerCircleColor={donut ? colors.surface : undefined}
        centerLabelComponent={centerLabelComponent}
      />
    </View>
  );
});
FinancifyPieChart.displayName = 'FinancifyPieChart';
