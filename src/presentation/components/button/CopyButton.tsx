import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface CopyButtonProps {
  text: string;
  label?: string;
  showLabel?: boolean;
  copiedLabel?: string;
  size?: number;
  disabled?: boolean;
  onCopy?: () => void;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = React.memo(({
  text,
  label,
  showLabel = false,
  copiedLabel = 'Copiado',
  size = 20,
  disabled = false,
  onCopy,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (disabled) return;
    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      onCopy?.();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }, [text, onCopy, disabled]);

  const iconColor = useMemo(() => {
    if (disabled) return theme.colors.onSurfaceVariant;
    return copied ? theme.colors.primary : theme.colors.onSurfaceVariant;
  }, [copied, disabled, theme.colors.primary, theme.colors.onSurfaceVariant]);

  const labelStyle = useMemo(() => ({
    color: iconColor,
  }), [iconColor]);

  return (
    <Pressable
      onPress={handleCopy}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        disabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `Copiar ${label || text}`}
      accessibilityRole="button"
      hitSlop={8}
    >
      <MaterialCommunityIcons
        name={(copied ? 'check' : 'content-copy') as keyof typeof MaterialCommunityIcons.glyphMap}
        size={size}
        color={iconColor}
      />
      {showLabel ? (
        <Text variant="labelSmall" style={labelStyle}>
          {copied ? copiedLabel : (label || 'Copiar')}
        </Text>
      ) : null}
    </Pressable>
  );
});
CopyButton.displayName = 'CopyButton';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.4,
  },
});
