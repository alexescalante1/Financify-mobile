import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { RadioButton, Text, HelperText, useTheme } from 'react-native-paper';

interface RadioOption {
  key: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  horizontal?: boolean;
  error?: boolean;
  errorMessage?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = React.memo(({
  label,
  options,
  value,
  onValueChange,
  disabled = false,
  horizontal = true,
  error = false,
  errorMessage,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const handleValueChange = useCallback((val: string) => {
    onValueChange(val);
  }, [onValueChange]);

  const containerStyle = useMemo(() => ({
    backgroundColor: theme.colors.surfaceVariant,
    padding: 12,
    borderRadius: 10,
  }), [theme.colors.surfaceVariant]);

  const labelStyle = useMemo(() => ({
    color: theme.colors.onBackground,
    fontWeight: '500' as const,
    marginBottom: 8,
  }), [theme.colors.onBackground]);

  const textColor = useMemo(() => ({
    color: theme.colors.onBackground,
  }), [theme.colors.onBackground]);

  const optionsLayout = useMemo(() => [
    styles.optionsRow,
    { flexDirection: horizontal ? 'row' as const : 'column' as const },
    horizontal && { justifyContent: 'space-around' as const },
  ], [horizontal]);

  const hasError = error && !!errorMessage;

  return (
    <View
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
    >
      <Text variant="bodyLarge" style={labelStyle}>
        {label}
      </Text>
      <View style={containerStyle}>
        <RadioButton.Group onValueChange={handleValueChange} value={value}>
          <View style={optionsLayout}>
            {options.map((option) => (
              <View key={option.key} style={styles.optionItem}>
                <RadioButton value={option.key} disabled={disabled} />
                <Text style={textColor}>{option.label}</Text>
              </View>
            ))}
          </View>
        </RadioButton.Group>
      </View>
      <HelperText type="error" visible={hasError}>
        {errorMessage}
      </HelperText>
    </View>
  );
});
RadioGroup.displayName = 'RadioGroup';

const styles = StyleSheet.create({
  optionsRow: {
    alignItems: 'center',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
