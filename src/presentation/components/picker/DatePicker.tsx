import React, { useState, useCallback, useMemo } from 'react';
import { View, TouchableOpacity, ViewStyle, Platform, StyleSheet } from 'react-native';
import { TextInput, HelperText, useTheme, Text } from 'react-native-paper';
import { useInputTheme } from '@/presentation/hooks/useInputTheme';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label: string;
  value: Date | undefined;
  onChange: (date: Date) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  locale?: string;
  icon?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const formatDate = (date: Date, locale: string): string => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const DatePicker: React.FC<DatePickerProps> = React.memo(({
  label,
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  minimumDate,
  maximumDate,
  locale = 'es-PE',
  icon = 'calendar',
  disabled = false,
  error = false,
  errorMessage,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const inputTheme = useInputTheme();
  const [showPicker, setShowPicker] = useState(false);

  const openPicker = useCallback(() => {
    if (!disabled) setShowPicker(true);
  }, [disabled]);

  const closePicker = useCallback(() => {
    setShowPicker(false);
  }, []);

  const handleChange = useCallback((
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === 'android') {
      closePicker();
      if (event.type === 'set' && selectedDate) {
        onChange(selectedDate);
      }
      return;
    }
    // iOS: update value continuously without closing
    if (selectedDate) {
      onChange(selectedDate);
    }
  }, [onChange, closePicker]);

  const displayValue = useMemo(() => {
    if (!value) return '';
    return formatDate(value, locale);
  }, [value, locale]);

  const inputStyle = useMemo(() => ({
    opacity: disabled ? 0.5 : 1,
  }), [disabled]);

  const leftIcon = useMemo(
    () => <TextInput.Icon icon={icon} />,
    [icon],
  );

  const iosHeaderStyle = useMemo(
    () => [dpStyles.iosHeader, { backgroundColor: theme.colors.surfaceVariant }],
    [theme.colors.surfaceVariant],
  );

  const iosLabelStyle = useMemo(
    () => ({ color: theme.colors.primary }),
    [theme.colors.primary],
  );

  const hasError = error && !!errorMessage;

  return (
    <View
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
    >
      <TouchableOpacity
        onPress={openPicker}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <TextInput
          label={label}
          value={displayValue}
          placeholder={placeholder}
          mode="outlined"
          editable={false}
          pointerEvents="none"
          theme={inputTheme}
          left={leftIcon}
          error={hasError}
          style={inputStyle}
        />
      </TouchableOpacity>
      <HelperText type="error" visible={hasError}>
        {errorMessage}
      </HelperText>

      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {showPicker && Platform.OS === 'ios' && (
        <View style={dpStyles.iosContainer}>
          <View style={iosHeaderStyle}>
            <TouchableOpacity onPress={closePicker} hitSlop={8}>
              <Text variant="labelLarge" style={iosLabelStyle}>Listo</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
          />
        </View>
      )}
    </View>
  );
});

DatePicker.displayName = 'DatePicker';

const dpStyles = StyleSheet.create({
  iosContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
