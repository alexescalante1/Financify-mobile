import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NumericKeypadProps {
  value: string;
  onValueChange: (value: string) => void;
  maxDecimals?: number;
  maxLength?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'backspace'],
];

export const NumericKeypad: React.FC<NumericKeypadProps> = React.memo(({
  value,
  onValueChange,
  maxDecimals = 2,
  maxLength = 12,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const valueRef = useRef(value);
  useEffect(() => { valueRef.current = value; }, [value]);

  const handlePress = useCallback((key: string) => {
    const current = valueRef.current;
    if (key === 'backspace') {
      onValueChange(current.slice(0, -1));
      return;
    }

    if (key === '.') {
      if (current.includes('.')) return;
      onValueChange(current.length === 0 ? '0.' : current + '.');
      return;
    }

    // Prevent leading zeros (except "0.")
    if (current === '0' && key !== '.') {
      onValueChange(key);
      return;
    }

    // Check max decimals
    const dotIndex = current.indexOf('.');
    if (dotIndex !== -1 && current.length - dotIndex > maxDecimals) return;

    // Check max length
    if (current.length >= maxLength) return;

    onValueChange(current + key);
  }, [onValueChange, maxDecimals, maxLength]);

  const textColor = theme.colors.onSurface;
  const pressedBg = theme.colors.surfaceVariant;

  const keyTextStyle = useMemo(() => ({
    color: textColor,
  }), [textColor]);

  const pressedStyle = useMemo(() => ({
    backgroundColor: pressedBg,
  }), [pressedBg]);

  const renderKey = useCallback((key: string) => {
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
  }, [handlePress, onValueChange, textColor, pressedStyle, keyTextStyle]);

  return (
    <View style={[styles.container, style]} testID={testID} accessibilityLabel={accessibilityLabel || 'Teclado numerico'}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(renderKey)}
        </View>
      ))}
    </View>
  );
});
NumericKeypad.displayName = 'NumericKeypad';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
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
