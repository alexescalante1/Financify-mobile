import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { TextInput, HelperText, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedDialog } from '@/presentation/components/dialog/AnimatedDialog';

interface SelectorOption {
  key: string;
  label: string;
  icon?: string;
  description?: string;
}

interface SelectorInputProps {
  label: string;
  value: string;
  options: SelectorOption[];
  onSelect: (key: string) => void;
  placeholder?: string;
  icon?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const SelectorInput: React.FC<SelectorInputProps> = React.memo(({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Seleccionar...',
  icon,
  disabled = false,
  error = false,
  errorMessage,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const [dialogVisible, setDialogVisible] = useState(false);

  const displayValue = useMemo(() => {
    const selected = options.find(o => o.key === value);
    return selected?.label || '';
  }, [options, value]);

  const openDialog = useCallback(() => {
    if (!disabled) setDialogVisible(true);
  }, [disabled]);

  const closeDialog = useCallback(() => {
    setDialogVisible(false);
  }, []);

  const handleSelect = useCallback((key: string) => {
    onSelect(key);
    closeDialog();
  }, [onSelect, closeDialog]);

  const hasError = error && !!errorMessage;

  const leftIcon = useMemo(
    () => (icon ? <TextInput.Icon icon={icon} /> : undefined),
    [icon],
  );

  const rightIcon = useMemo(
    () => <TextInput.Icon icon="chevron-down" />,
    [],
  );

  const textInputStyle = useMemo(
    () => ({ opacity: disabled ? 0.5 : 1 }),
    [disabled],
  );

  const primaryColor = theme.colors.primary;
  const primaryContainerColor = theme.colors.primaryContainer;
  const surfaceVariantColor = theme.colors.surfaceVariant;
  const onSurfaceColor = theme.colors.onSurface;
  const onSurfaceVariantColor = theme.colors.onSurfaceVariant;

  const renderOption = useCallback(({ item }: { item: SelectorOption }) => {
    const isSelected = item.key === value;
    return (
      <Pressable
        onPress={() => handleSelect(item.key)}
        style={({ pressed }) => [
          styles.option,
          {
            backgroundColor: isSelected
              ? primaryContainerColor
              : pressed
                ? surfaceVariantColor
                : 'transparent',
          },
        ]}
        accessibilityLabel={item.label}
        accessibilityState={{ selected: isSelected }}
        accessibilityRole="radio"
      >
        {item.icon ? (
          <MaterialCommunityIcons
            name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={24}
            color={isSelected ? primaryColor : onSurfaceVariantColor}
            style={styles.optionIcon}
          />
        ) : null}

        <View style={styles.optionText}>
          <Text
            variant="bodyLarge"
            style={{ color: isSelected ? primaryColor : onSurfaceColor }}
          >
            {item.label}
          </Text>
          {item.description ? (
            <Text
              variant="bodySmall"
              style={{ color: onSurfaceVariantColor }}
            >
              {item.description}
            </Text>
          ) : null}
        </View>

        {isSelected ? (
          <MaterialCommunityIcons
            name="check"
            size={20}
            color={primaryColor}
          />
        ) : null}
      </Pressable>
    );
  }, [value, handleSelect, primaryColor, primaryContainerColor, surfaceVariantColor, onSurfaceColor, onSurfaceVariantColor]);

  const keyExtractor = useCallback((item: SelectorOption) => item.key, []);

  return (
    <View style={style} testID={testID}>
      <Pressable
        onPress={openDialog}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityRole="button"
      >
        <TextInput
          label={label}
          value={displayValue}
          placeholder={placeholder}
          mode="outlined"
          editable={false}
          pointerEvents="none"
          left={leftIcon}
          right={rightIcon}
          error={hasError}
          style={textInputStyle}
        />
      </Pressable>
      <HelperText type="error" visible={hasError}>
        {errorMessage}
      </HelperText>

      <AnimatedDialog
        visible={dialogVisible}
        onDismiss={closeDialog}
        showCloseButton
      >
        <Text variant="titleMedium" style={styles.dialogTitle}>
          {label}
        </Text>
        <FlatList
          data={options}
          renderItem={renderOption}
          keyExtractor={keyExtractor}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      </AnimatedDialog>
    </View>
  );
});
SelectorInput.displayName = 'SelectorInput';

const styles = StyleSheet.create({
  dialogTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    maxHeight: 300,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
});
