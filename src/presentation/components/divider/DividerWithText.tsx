import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface DividerWithTextProps {
  text: string;
  color?: string;
  textColor?: string;
  textVariant?: 'bodySmall' | 'bodyMedium' | 'bodyLarge' | 'labelSmall' | 'labelMedium';
  thickness?: number;
  spacing?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const DividerWithText: React.FC<DividerWithTextProps> = React.memo(({
  text,
  color,
  textColor,
  textVariant = 'bodySmall',
  thickness = 1,
  spacing = 12,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const lineColor = color || theme.colors.outlineVariant;
  const labelColor = textColor || theme.colors.onSurfaceVariant;

  const lineStyle = useMemo(() => ({
    flex: 1,
    height: thickness,
    backgroundColor: lineColor,
  }), [thickness, lineColor]);

  const textStyle = useMemo(() => ({
    marginHorizontal: spacing,
    color: labelColor,
  }), [spacing, labelColor]);

  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={lineStyle} />
      <Text variant={textVariant} style={textStyle}>
        {text}
      </Text>
      <View style={lineStyle} />
    </View>
  );
});

DividerWithText.displayName = 'DividerWithText';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
});
