import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { View, TextInput, Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface OTPInputProps {
  length?: number;
  value: string;
  onValueChange: (value: string) => void;
  onComplete?: (code: string) => void;
  error?: boolean;
  errorMessage?: string;
  autoFocus?: boolean;
  secureEntry?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const OTPInput: React.FC<OTPInputProps> = React.memo(({
  length = 6,
  value,
  onValueChange,
  onComplete,
  error = false,
  errorMessage,
  autoFocus = true,
  secureEntry = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevError = useRef(false);

  const handleChange = useCallback((text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    onValueChange(cleaned);
    if (cleaned.length === length && onComplete) {
      onComplete(cleaned);
    }
  }, [length, onValueChange, onComplete]);

  const handlePress = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (autoFocus) {
      const timer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  // Shake animation on error
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (error && !prevError.current) {
      anim = Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]);
      anim.start();
    }
    prevError.current = error;
    return () => anim?.stop();
  }, [error, shakeAnim]);

  const borderDefault = theme.colors.outlineVariant;
  const borderActive = theme.colors.primary;
  const borderError = theme.colors.error;
  const textColor = theme.colors.onSurface;
  const filledBg = theme.colors.primaryContainer;

  const cellTextStyle = useMemo(() => ({
    color: textColor,
  }), [textColor]);

  const cells = useMemo(() => {
    const items = [];
    for (let i = 0; i < length; i++) {
      const char = value[i] || '';
      const isFocused = i === value.length && value.length < length;
      const isFilled = char.length > 0;

      let borderColor = borderDefault;
      if (error) borderColor = borderError;
      else if (isFocused) borderColor = borderActive;

      items.push(
        <View
          key={i}
          style={[
            styles.cell,
            {
              borderColor,
              backgroundColor: isFilled ? filledBg : 'transparent',
            },
            isFocused && !error && styles.cellFocused,
          ]}
        >
          <Text variant="headlineSmall" style={cellTextStyle}>
            {secureEntry && isFilled ? '\u2022' : char}
          </Text>
        </View>,
      );
    }
    return items;
  }, [value, length, error, secureEntry, borderDefault, borderActive, borderError, cellTextStyle, filledBg]);

  const errorStyle = useMemo(() => ({
    color: theme.colors.error,
  }), [theme.colors.error]);

  return (
    <View style={style} testID={testID} accessibilityLabel={accessibilityLabel || 'Codigo de verificacion'}>
      <Animated.View style={[styles.row, { transform: [{ translateX: shakeAnim }] }]}>
        <Pressable onPress={handlePress} style={styles.cellsRow}>
          {cells}
        </Pressable>
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        style={styles.hiddenInput}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
      />
      {error && errorMessage ? (
        <Text variant="bodySmall" style={[styles.errorText, errorStyle]}>
          {errorMessage}
        </Text>
      ) : null}
    </View>
  );
});
OTPInput.displayName = 'OTPInput';

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
  },
  cellsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cell: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellFocused: {
    borderWidth: 2,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
});
