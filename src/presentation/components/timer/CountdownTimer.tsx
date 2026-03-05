import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/presentation/theme/materialTheme';

interface CountdownTimerProps {
  seconds: number;
  onExpire?: () => void;
  onResend?: () => void;
  resendLabel?: string;
  running?: boolean;
  showIcon?: boolean;
  format?: 'mm:ss' | 'ss';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = React.memo(({
  seconds: initialSeconds,
  onExpire,
  onResend,
  resendLabel = 'Reenviar codigo',
  running = true,
  showIcon = true,
  format = 'mm:ss',
  size = 'md',
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];
  const [remaining, setRemaining] = useState(initialSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setRemaining(initialSeconds);
  }, [initialSeconds]);

  // Separate effect for expiration — avoids side effects inside setState updater
  useEffect(() => {
    if (remaining === 0) {
      onExpireRef.current?.();
    }
  }, [remaining]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, initialSeconds]);

  const formattedTime = useMemo(() => {
    if (format === 'ss') return `${remaining}s`;
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [remaining, format]);

  const textVariant = useMemo(() => {
    if (size === 'sm') return 'bodySmall' as const;
    if (size === 'lg') return 'titleLarge' as const;
    return 'bodyLarge' as const;
  }, [size]);

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;

  const isExpired = remaining <= 0;
  const isWarning = remaining > 0 && remaining <= 10;

  const timerColor = useMemo(() => {
    if (isExpired) return colors.error;
    if (isWarning) return colors.warning;
    return theme.colors.onSurface;
  }, [isExpired, isWarning, colors.error, colors.warning, theme.colors.onSurface]);

  const timerStyle = useMemo(() => ({
    color: timerColor,
  }), [timerColor]);

  const resendStyle = useMemo(() => ({
    color: theme.colors.primary,
  }), [theme.colors.primary]);

  return (
    <View style={[styles.container, style]} testID={testID} accessibilityLabel={accessibilityLabel || `Tiempo restante: ${formattedTime}`}>
      {isExpired && onResend ? (
        <Text variant="labelLarge" style={resendStyle} onPress={onResend}>
          {resendLabel}
        </Text>
      ) : (
        <View style={styles.row}>
          {showIcon ? (
            <MaterialCommunityIcons name="timer-outline" size={iconSize} color={timerColor} />
          ) : null}
          <Text variant={textVariant} style={timerStyle}>{formattedTime}</Text>
        </View>
      )}
    </View>
  );
});

CountdownTimer.displayName = 'CountdownTimer';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
