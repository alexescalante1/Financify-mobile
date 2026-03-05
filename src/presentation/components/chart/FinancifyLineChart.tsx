import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LineChart, lineDataItem } from 'react-native-gifted-charts';
import type { AppTheme } from '@/presentation/theme/materialTheme';
import { withAlpha } from '@/presentation/theme/colorUtils';

interface FinancifyLineChartProps {
  data: lineDataItem[];
  color?: string;
  gradientColor?: string;
  height?: number;
  curved?: boolean;
  areaChart?: boolean;
  showDataPoints?: boolean;
  yAxisPrefix?: string;
  thickness?: number;
  spacing?: number;
  initialSpacing?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const FinancifyLineChart: React.FC<FinancifyLineChartProps> = React.memo(({
  data,
  color,
  gradientColor,
  height = 200,
  curved = true,
  areaChart = true,
  showDataPoints = true,
  yAxisPrefix = 'S/ ',
  thickness = 2,
  spacing = 52,
  initialSpacing = 20,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];

  const lineColor = color || colors.primary;
  const fillColor = gradientColor || colors.primaryContainer;

  const yAxisTextStyle = useMemo(() => ({
    color: colors.onSurfaceVariant,
    fontSize: 11,
  }), [colors.onSurfaceVariant]);

  const xAxisLabelTextStyle = useMemo(() => ({
    color: colors.onSurfaceVariant,
    fontSize: 11,
  }), [colors.onSurfaceVariant]);

  const dataPointConfig = useMemo(() => ({
    dataPointsColor: lineColor,
    dataPointsRadius: 4,
  }), [lineColor]);

  return (
    <View
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel || 'Gráfico de línea'}
    >
      <LineChart
        data={data}
        height={height}
        curved={curved}
        areaChart={areaChart}
        color={lineColor}
        thickness={thickness}
        spacing={spacing}
        initialSpacing={initialSpacing}
        startFillColor={fillColor}
        endFillColor={withAlpha(fillColor, 0)}
        hideDataPoints={!showDataPoints}
        {...(showDataPoints ? dataPointConfig : {})}
        yAxisTextStyle={yAxisTextStyle}
        yAxisLabelPrefix={yAxisPrefix}
        xAxisLabelTextStyle={xAxisLabelTextStyle}
        xAxisColor={colors.outlineVariant}
        yAxisColor={colors.outlineVariant}
        rulesColor={withAlpha(colors.outlineVariant, 0.5)}
        rulesType="dashed"
        noOfSections={4}
      />
    </View>
  );
});
FinancifyLineChart.displayName = 'FinancifyLineChart';
