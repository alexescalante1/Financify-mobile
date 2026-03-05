import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { BarChart, barDataItem } from 'react-native-gifted-charts';
import type { AppTheme } from '@/presentation/theme/materialTheme';
import { withAlpha } from '@/presentation/theme/colorUtils';

interface FinancifyBarChartProps {
  data: barDataItem[];
  barWidth?: number;
  spacing?: number;
  initialSpacing?: number;
  height?: number;
  showValuesOnTopOfBars?: boolean;
  yAxisPrefix?: string;
  barBorderRadius?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const FinancifyBarChart: React.FC<FinancifyBarChartProps> = React.memo(({
  data,
  barWidth = 30,
  spacing = 20,
  initialSpacing = 20,
  height = 200,
  showValuesOnTopOfBars = true,
  yAxisPrefix = 'S/ ',
  barBorderRadius = 4,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];

  const themedData = useMemo(() =>
    data.map(item => ({
      ...item,
      frontColor: item.frontColor || colors.primary,
    })),
    [data, colors.primary]
  );

  const yAxisTextStyle = useMemo(() => ({
    color: colors.onSurfaceVariant,
    fontSize: 11,
  }), [colors.onSurfaceVariant]);

  const xAxisLabelTextStyle = useMemo(() => ({
    color: colors.onSurfaceVariant,
    fontSize: 11,
  }), [colors.onSurfaceVariant]);

  const topLabelTextStyle = useMemo(() => ({
    color: colors.onSurfaceVariant,
    fontSize: 10,
  }), [colors.onSurfaceVariant]);

  return (
    <View
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel || 'Gráfico de barras'}
    >
      <BarChart
        data={themedData}
        barWidth={barWidth}
        spacing={spacing}
        initialSpacing={initialSpacing}
        height={height}
        barBorderRadius={barBorderRadius}
        showValuesAsTopLabel={showValuesOnTopOfBars}
        topLabelTextStyle={topLabelTextStyle}
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
FinancifyBarChart.displayName = 'FinancifyBarChart';
