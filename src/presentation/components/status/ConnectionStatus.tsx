import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/presentation/theme/materialTheme';
import { withAlpha } from '@/presentation/theme/colorUtils';

type ConnectionState = 'online' | 'offline' | 'syncing';

interface ConnectionStatusProps {
  status: ConnectionState;
  showLabel?: boolean;
  compact?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const STATUS_CONFIG: Record<ConnectionState, { icon: string; label: string }> = {
  online: { icon: 'wifi', label: 'Conectado' },
  offline: { icon: 'wifi-off', label: 'Sin conexión' },
  syncing: { icon: 'cloud-sync-outline', label: 'Sincronizando...' },
};

export const ConnectionStatus: React.FC<ConnectionStatusProps> = React.memo(({
  status,
  showLabel = true,
  compact = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'syncing') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const statusColor = useMemo(() => {
    const colorMap: Record<ConnectionState, string> = {
      online: colors.success,
      offline: colors.loss,
      syncing: colors.warning,
    };
    return colorMap[status];
  }, [status, colors.success, colors.loss, colors.warning]);

  const config = STATUS_CONFIG[status];
  const iconSize = compact ? 14 : 18;

  const dotStyle = useMemo(() => ({
    width: compact ? 6 : 8,
    height: compact ? 6 : 8,
    borderRadius: compact ? 3 : 4,
    backgroundColor: statusColor,
  }), [compact, statusColor]);

  const labelStyle = useMemo(() => ({
    color: statusColor,
  }), [statusColor]);

  const bgStyle = useMemo(() => ({
    backgroundColor: withAlpha(statusColor, 0.08),
    borderColor: withAlpha(statusColor, 0.19),
    paddingVertical: compact ? 4 : 8,
    paddingHorizontal: compact ? 8 : 12,
    borderRadius: compact ? 12 : 16,
  }), [compact, statusColor]);

  return (
    <Animated.View
      style={[styles.container, bgStyle, { opacity: pulseAnim }, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || config.label}
    >
      <View style={dotStyle} />
      {!compact && (
        <MaterialCommunityIcons
          name={config.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={iconSize}
          color={statusColor}
        />
      )}
      {showLabel && (
        <Text
          variant={compact ? 'labelSmall' : 'bodySmall'}
          style={[styles.label, labelStyle]}
          numberOfLines={1}
        >
          {config.label}
        </Text>
      )}
    </Animated.View>
  );
});
ConnectionStatus.displayName = 'ConnectionStatus';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontWeight: '500',
  },
});
