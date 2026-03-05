import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/presentation/theme/materialTheme';
import { withAlpha } from '@/presentation/theme/colorUtils';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertAction {
  label: string;
  onPress: () => void;
}

interface AlertBannerProps {
  message: string;
  type?: AlertType;
  icon?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: AlertAction;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const DEFAULT_ICONS: Record<AlertType, string> = {
  info: 'information-outline',
  success: 'check-circle-outline',
  warning: 'alert-outline',
  error: 'alert-circle-outline',
};

export const AlertBanner: React.FC<AlertBannerProps> = React.memo(({
  message,
  type = 'info',
  icon,
  dismissible = false,
  onDismiss,
  action,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];

  const typeColors = useMemo(() => {
    const colorMap: Record<AlertType, { fg: string; bg: string }> = {
      info: { fg: colors.info, bg: withAlpha(colors.info, 0.12) },
      success: { fg: colors.success, bg: withAlpha(colors.success, 0.12) },
      warning: { fg: colors.warning, bg: withAlpha(colors.warning, 0.12) },
      error: { fg: colors.error, bg: withAlpha(colors.error, 0.12) },
    };
    return colorMap[type];
  }, [type, colors.info, colors.success, colors.warning, colors.error]);

  const containerStyle = useMemo(() => ({
    backgroundColor: typeColors.bg,
    borderLeftColor: typeColors.fg,
  }), [typeColors]);

  const textStyle = useMemo(() => ({
    color: theme.colors.onSurface,
    flex: 1,
  }), [theme.colors.onSurface]);

  const actionTextStyle = useMemo(() => ({
    color: typeColors.fg,
    fontWeight: '600' as const,
  }), [typeColors.fg]);

  const resolvedIcon = icon || DEFAULT_ICONS[type];

  return (
    <View
      style={[styles.container, containerStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || message}
      accessibilityRole="alert"
    >
      <MaterialCommunityIcons
        name={resolvedIcon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={20}
        color={typeColors.fg}
        style={styles.icon}
      />
      <Text variant="bodyMedium" style={textStyle}>
        {message}
      </Text>
      {action ? (
        <Text
          variant="labelMedium"
          style={actionTextStyle}
          onPress={action.onPress}
        >
          {action.label}
        </Text>
      ) : null}
      {dismissible && onDismiss ? (
        <IconButton
          icon="close"
          size={16}
          onPress={onDismiss}
          style={styles.dismissButton}
        />
      ) : null}
    </View>
  );
});
AlertBanner.displayName = 'AlertBanner';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderLeftWidth: 3,
    borderRadius: 8,
  },
  icon: {
    marginRight: 12,
  },
  dismissButton: {
    margin: 0,
    marginLeft: 4,
  },
});
