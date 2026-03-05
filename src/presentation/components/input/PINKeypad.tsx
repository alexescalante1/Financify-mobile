import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PINKeypadProps {
  value: string;
  onValueChange: (value: string) => void;
  onComplete?: (pin: string) => void;
  length?: number;
  error?: boolean;
  errorMessage?: string;
  biometricType?: 'fingerprint' | 'face' | null;
  onBiometric?: () => void;
  title?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['biometric', '0', 'backspace'],
];

export const PINKeypad: React.FC<PINKeypadProps> = React.memo(({
  value,
  onValueChange,
  onComplete,
  length = 4,
  error = false,
  errorMessage,
  biometricType = null,
  onBiometric,
  title = 'Ingresa tu PIN',
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevError = useRef(false);
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  // Shake animation on error
  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (error && !prevError.current) {
      anim = Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
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

  const handlePress = useCallback((key: string) => {
    const current = valueRef.current;
    if (key === 'backspace') {
      onValueChange(current.slice(0, -1));
      return;
    }
    if (key === 'biometric') {
      onBiometric?.();
      return;
    }
    if (current.length >= length) return;
    const newValue = current + key;
    onValueChange(newValue);
    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  }, [onValueChange, onComplete, length, onBiometric]);

  const textColor = theme.colors.onSurface;
  const pressedBg = theme.colors.surfaceVariant;
  const dotActive = theme.colors.primary;
  const dotInactive = theme.colors.outlineVariant;
  const dotError = theme.colors.error;

  const dots = useMemo(() => {
    const items = [];
    for (let i = 0; i < length; i++) {
      const filled = i < value.length;
      items.push(
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: error
                ? dotError
                : filled
                  ? dotActive
                  : 'transparent',
              borderColor: error ? dotError : filled ? dotActive : dotInactive,
            },
          ]}
        />,
      );
    }
    return items;
  }, [value.length, length, error, dotActive, dotInactive, dotError]);

  const biometricIcon = useMemo(() => {
    if (biometricType === 'face') return 'face-recognition';
    if (biometricType === 'fingerprint') return 'fingerprint';
    return null;
  }, [biometricType]);

  const errorStyle = useMemo(() => ({
    color: theme.colors.error,
  }), [theme.colors.error]);

  const titleStyle = useMemo(() => ({
    color: theme.colors.onSurface,
  }), [theme.colors.onSurface]);

  const keyTextStyle = useMemo(() => ({
    color: textColor,
  }), [textColor]);

  const pressedStyle = useMemo(() => ({
    backgroundColor: pressedBg,
  }), [pressedBg]);

  const renderKey = useCallback((key: string) => {
    if (key === 'biometric') {
      if (!biometricIcon || !onBiometric) {
        return <View key={key} style={styles.key} />;
      }
      return (
        <Pressable
          key={key}
          onPress={() => handlePress(key)}
          style={({ pressed }) => [
            styles.key,
            pressed && pressedStyle,
          ]}
          accessibilityLabel={biometricType === 'face' ? 'Reconocimiento facial' : 'Huella dactilar'}
        >
          <MaterialCommunityIcons
            name={biometricIcon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={28}
            color={theme.colors.primary}
          />
        </Pressable>
      );
    }

    if (key === 'backspace') {
      return (
        <Pressable
          key={key}
          onPress={() => handlePress(key)}
          onLongPress={() => onValueChange('')}
          style={({ pressed }) => [
            styles.key,
            pressed && pressedStyle,
          ]}
          accessibilityLabel="Borrar"
        >
          <MaterialCommunityIcons name={"backspace-outline" as keyof typeof MaterialCommunityIcons.glyphMap} size={24} color={textColor} />
        </Pressable>
      );
    }

    return (
      <Pressable
        key={key}
        onPress={() => handlePress(key)}
        style={({ pressed }) => [
          styles.key,
          pressed && pressedStyle,
        ]}
        accessibilityLabel={key}
      >
        <Text variant="headlineSmall" style={keyTextStyle}>{key}</Text>
      </Pressable>
    );
  }, [handlePress, onValueChange, textColor, pressedStyle, biometricIcon, onBiometric, biometricType, theme.colors.primary, keyTextStyle]);

  return (
    <View style={[styles.container, style]} testID={testID} accessibilityLabel={accessibilityLabel || 'Teclado PIN'}>
      <Text variant="titleMedium" style={[styles.title, titleStyle]}>{title}</Text>

      <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {dots}
      </Animated.View>

      {error && errorMessage ? (
        <Text variant="bodySmall" style={[styles.errorText, errorStyle]}>{errorMessage}</Text>
      ) : null}

      <View style={styles.keypad}>
        {KEYS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map(renderKey)}
          </View>
        ))}
      </View>
    </View>
  );
});
PINKeypad.displayName = 'PINKeypad';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  errorText: {
    marginBottom: 8,
  },
  keypad: {
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  key: {
    flex: 1,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    margin: 4,
  },
});
