import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useInputTheme } from '@/presentation/hooks/useInputTheme';

interface TextAreaProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: unknown) => void;
  placeholder?: string;
  maxLength?: number;
  numberOfLines?: number;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  showCharCount?: boolean;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const TextArea: React.FC<TextAreaProps> = React.memo(({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  maxLength,
  numberOfLines = 4,
  error = false,
  errorMessage,
  disabled = false,
  showCharCount = false,
  style,
  inputStyle,
  testID,
  accessibilityLabel,
}) => {
  const inputTheme = useInputTheme();

  const hasError = error && !!errorMessage;

  const handleChangeText = useCallback((text: string) => {
    if (maxLength && text.length > maxLength) return;
    onChangeText(text);
  }, [onChangeText, maxLength]);

  const computedInputStyle = useMemo(() => ({
    minHeight: numberOfLines * 24,
    textAlignVertical: 'top' as const,
  }), [numberOfLines]);

  const charCountText = useMemo(() => {
    if (!showCharCount) return '';
    if (maxLength) return `${value.length}/${maxLength}`;
    return `${value.length}`;
  }, [showCharCount, value.length, maxLength]);

  return (
    <View style={[styles.wrapper, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={handleChangeText}
        onBlur={onBlur}
        placeholder={placeholder}
        mode="outlined"
        multiline
        numberOfLines={numberOfLines}
        theme={inputTheme}
        error={hasError}
        editable={!disabled}
        maxLength={maxLength}
        style={[computedInputStyle, inputStyle]}
        testID={testID}
        accessibilityLabel={accessibilityLabel || label}
      />
      {hasError ? (
        <HelperText type="error" visible>
          {errorMessage}
        </HelperText>
      ) : showCharCount ? (
        <HelperText type="info" visible style={styles.charCount}>
          {charCountText}
        </HelperText>
      ) : (
        <HelperText type="error" visible={false}>
          {' '}
        </HelperText>
      )}
    </View>
  );
});
TextArea.displayName = 'TextArea';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 2,
  },
  charCount: {
    textAlign: 'right',
  },
});
