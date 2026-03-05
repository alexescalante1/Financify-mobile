import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface LegendItem {
  label: string;
  color: string;
  value?: string;
}

interface ChartLegendProps {
  items: LegendItem[];
  direction?: 'horizontal' | 'vertical';
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const ChartLegend: React.FC<ChartLegendProps> = React.memo(({
  items,
  direction = 'vertical',
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const labelColor = useMemo(() => ({
    color: theme.colors.onSurface,
  }), [theme.colors.onSurface]);

  const valueColor = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  return (
    <View
      style={[direction === 'horizontal' ? styles.horizontal : styles.vertical, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          <View style={[styles.dot, { backgroundColor: item.color }]} />
          <Text variant="bodySmall" style={labelColor} numberOfLines={1}>{item.label}</Text>
          {item.value ? (
            <Text variant="bodySmall" style={valueColor}>{item.value}</Text>
          ) : null}
        </View>
      ))}
    </View>
  );
});
ChartLegend.displayName = 'ChartLegend';

const styles = StyleSheet.create({
  vertical: {
    gap: 8,
  },
  horizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
