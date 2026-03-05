import React, { useCallback, useMemo } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type CheckboxSize = 'sm' | 'md' | 'lg';

const SIZE_CONFIG: Record<CheckboxSize, { box: number; icon: number; gap: number }> = {
  sm: { box: 18, icon: 14, gap: 8 },
  md: { box: 22, icon: 18, gap: 12 },
  lg: { box: 26, icon: 22, gap: 12 },
};

interface CheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  description?: string;
  size?: CheckboxSize;
  disabled?: boolean;
  error?: boolean;
  indeterminate?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const Checkbox: React.FC<CheckboxProps> = React.memo(({
  checked,
  onToggle,
  label,
  description,
  size = 'md',
  disabled = false,
  error = false,
  indeterminate = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const config = SIZE_CONFIG[size];

  const handleToggle = useCallback(() => {
    if (!disabled) {
      onToggle(!checked);
    }
  }, [disabled, checked, onToggle]);

  const boxColor = useMemo(() => {
    if (disabled) return theme.colors.onSurfaceVariant;
    if (error) return theme.colors.error;
    if (checked || indeterminate) return theme.colors.primary;
    return theme.colors.outline;
  }, [disabled, error, checked, indeterminate, theme.colors]);

  const boxBgColor = useMemo(() => {
    if (checked || indeterminate) {
      if (disabled) return theme.colors.onSurfaceVariant;
      if (error) return theme.colors.error;
      return theme.colors.primary;
    }
    return 'transparent';
  }, [checked, indeterminate, disabled, error, theme.colors]);

  const iconColor = useMemo(() => {
    if (checked || indeterminate) return theme.colors.onPrimary;
    return 'transparent';
  }, [checked, indeterminate, theme.colors.onPrimary]);

  const boxStyle = useMemo(() => ({
    width: config.box,
    height: config.box,
    borderRadius: 4,
    borderWidth: checked || indeterminate ? 0 : 2,
    borderColor: boxColor,
    backgroundColor: boxBgColor,
  }), [config.box, checked, indeterminate, boxColor, boxBgColor]);

  const descriptionStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  }), [theme.colors.onSurfaceVariant]);

  const iconName = indeterminate ? 'minus' : 'check';

  return (
    <Pressable
      onPress={handleToggle}
      disabled={disabled}
      style={[
        styles.container,
        { gap: config.gap, opacity: disabled ? 0.5 : 1 },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label || (checked ? 'Marcado' : 'No marcado')}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <View style={[styles.box, boxStyle]}>
        {(checked || indeterminate) && (
          <MaterialCommunityIcons
            name={iconName as keyof typeof MaterialCommunityIcons.glyphMap}
            size={config.icon}
            color={iconColor}
          />
        )}
      </View>
      {(label || description) && (
        <View style={styles.textContainer}>
          {label && (
            <Text variant={size === 'sm' ? 'bodySmall' : 'bodyMedium'}>
              {label}
            </Text>
          )}
          {description && (
            <Text variant="bodySmall" style={descriptionStyle}>
              {description}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
});
Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
});
