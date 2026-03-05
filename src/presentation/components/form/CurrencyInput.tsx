import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useInputTheme } from '@/presentation/hooks/useInputTheme';

const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: 'S/',
  USD: '$',
  EUR: '€',
};

interface CurrencyInputProps {
  label: string;
  value: number | undefined;
  onValueChange: (value: number | undefined) => void;
  currency?: string;
  currencySymbol?: string;
  locale?: string;
  maxValue?: number;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = React.memo(({
  label,
  value,
  onValueChange,
  currency = 'PEN',
  currencySymbol,
  locale = 'es-PE',
  maxValue,
  disabled = false,
  error = false,
  errorMessage,
  style,
  inputStyle,
  testID,
  accessibilityLabel,
}) => {
  const inputTheme = useInputTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [rawText, setRawText] = useState('');
  const rawTextRef = useRef('');

  const symbol = currencySymbol || CURRENCY_SYMBOLS[currency] || currency;

  const formattedValue = useMemo(() => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }, [value, locale]);

  const displayText = isFocused ? rawText : formattedValue;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    const initial = value !== undefined && value !== null ? String(value) : '';
    rawTextRef.current = initial;
    setRawText(initial);
  }, [value]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const normalized = rawTextRef.current.replace(',', '.');
    const parsed = parseFloat(normalized);
    if (isNaN(parsed)) {
      onValueChange(undefined);
    } else {
      const clamped = maxValue !== undefined ? Math.min(parsed, maxValue) : parsed;
      onValueChange(Math.round(clamped * 100) / 100);
    }
  }, [onValueChange, maxValue]);

  const handleChangeText = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9.,]/g, '');
    rawTextRef.current = cleaned;
    setRawText(cleaned);
  }, []);

  const leftAffix = useMemo(() => (
    <TextInput.Affix text={symbol} />
  ), [symbol]);

  const hasError = error && !!errorMessage;

  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        label={label}
        value={displayText}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        mode="outlined"
        theme={inputTheme}
        keyboardType="decimal-pad"
        left={leftAffix}
        error={hasError}
        editable={!disabled}
        style={inputStyle}
        testID={testID}
        accessibilityLabel={accessibilityLabel || label}
      />
      <HelperText type="error" visible={hasError}>
        {errorMessage}
      </HelperText>
    </View>
  );
});
CurrencyInput.displayName = 'CurrencyInput';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 2,
  },
});
