import React, { useMemo } from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface NotificationBellProps {
  count?: number;
  maxCount?: number;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = React.memo(({
  count = 0,
  maxCount = 99,
  onPress,
  size = 24,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const displayCount = useMemo(() => {
    if (count <= 0) return null;
    if (count > maxCount) return `${maxCount}+`;
    return `${count}`;
  }, [count, maxCount]);

  const badgeStyle = useMemo(() => ({
    backgroundColor: theme.colors.error,
    minWidth: displayCount && displayCount.length > 1 ? 20 : 16,
  }), [theme.colors.error, displayCount]);

  const label = accessibilityLabel || `Notificaciones${count > 0 ? `, ${count} nuevas` : ''}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.6 : 1 },
        style,
      ]}
      testID={testID}
      accessibilityLabel={label}
      accessibilityRole="button"
      hitSlop={8}
    >
      <MaterialCommunityIcons
        name={count > 0 ? 'bell-ring-outline' : 'bell-outline'}
        size={size}
        color={theme.colors.onSurface}
      />
      {displayCount ? (
        <View style={[styles.badge, badgeStyle]}>
          <Text style={[styles.badgeText, { color: theme.colors.onError }]}>{displayCount}</Text>
        </View>
      ) : null}
    </Pressable>
  );
});

NotificationBell.displayName = 'NotificationBell';

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
