import React, { useState, useMemo, useCallback } from 'react';
import { View, ViewStyle, KeyboardTypeOptions, StyleSheet } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useInputTheme } from '@/presentation/hooks/useInputTheme';

interface FormInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: (e: unknown) => void;
  error?: boolean;
  errorMessage?: string;
  icon?: string;
  mode?: 'outlined' | 'flat';
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const FormInput: React.FC<FormInputProps> = React.memo(({
  label,
  value,
  onChangeText,
  onBlur,
  error = false,
  errorMessage,
  icon,
  mode = 'outlined',
  secureTextEntry = false,
  keyboardType,
  autoCapitalize,
  autoCorrect,
  editable = true,
  disabled = false,
  style,
  inputStyle,
  testID,
  accessibilityLabel,
}) => {
  const inputTheme = useInputTheme();
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const isEditable = editable && !disabled;
  const hasError = error && !!errorMessage;

  const leftIcon = useMemo(
    () => (icon ? <TextInput.Icon icon={icon} /> : undefined),
    [icon],
  );

  const rightIcon = useMemo(
    () => secureTextEntry ? (
      <TextInput.Icon
        icon={showPassword ? 'eye-off' : 'eye'}
        onPress={togglePassword}
      />
    ) : undefined,
    [secureTextEntry, showPassword, togglePassword],
  );

  return (
    <View style={[formStyles.wrapper, style]}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        mode={mode}
        theme={inputTheme}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry && !showPassword}
        left={leftIcon}
        right={rightIcon}
        error={hasError}
        editable={isEditable}
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
FormInput.displayName = 'FormInput';

const formStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 2,
  },
});
