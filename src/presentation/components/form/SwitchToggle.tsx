import React, { useCallback, useMemo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, Switch, useTheme } from 'react-native-paper';

interface SwitchToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  disabled?: boolean;
  color?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const SwitchToggle: React.FC<SwitchToggleProps> = React.memo(({
  label,
  value,
  onValueChange,
  description,
  disabled = false,
  color,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const handleToggle = useCallback(() => {
    if (!disabled) onValueChange(!value);
  }, [disabled, value, onValueChange]);

  const switchColor = color || theme.colors.primary;

  const containerStyle = useMemo(() => [
    styles.container,
    { opacity: disabled ? 0.5 : 1 },
    style,
  ], [disabled, style]);

  const descriptionStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      style={containerStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    >
      <View style={styles.textContainer}>
        <Text variant="bodyLarge">{label}</Text>
        {description ? (
          <Text variant="bodySmall" style={descriptionStyle}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        disabled={disabled}
        color={switchColor}
      />
    </Pressable>
  );
});

SwitchToggle.displayName = 'SwitchToggle';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
});
