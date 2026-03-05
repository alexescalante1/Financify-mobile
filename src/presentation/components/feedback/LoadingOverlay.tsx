import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native-paper';

type LoadingSize = 'sm' | 'md' | 'lg';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  overlay?: boolean;
  size?: LoadingSize;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const INDICATOR_SIZE: Record<LoadingSize, number> = {
  sm: 24,
  md: 36,
  lg: 48,
};

export const LoadingOverlay: React.FC<LoadingOverlayProps> = React.memo(({
  visible,
  message,
  overlay = true,
  size = 'md',
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const overlayStyle = useMemo(() => ({
    backgroundColor: theme.colors.surface + 'D9',
  }), [theme.colors.surface]);

  const messageStyle = useMemo(() => ({
    color: theme.colors.onSurface,
    marginTop: 12,
    textAlign: 'center' as const,
  }), [theme.colors.onSurface]);

  if (!visible) return null;

  const content = (
    <View
      style={[styles.content, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || message || 'Cargando'}
    >
      <ActivityIndicator
        animating
        size={INDICATOR_SIZE[size]}
        color={theme.colors.primary}
      />
      {message ? (
        <Text variant="bodyMedium" style={messageStyle}>
          {message}
        </Text>
      ) : null}
    </View>
  );

  if (!overlay) return content;

  return (
    <View style={[styles.overlay, overlayStyle]}>
      {content}
    </View>
  );
});
LoadingOverlay.displayName = 'LoadingOverlay';

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
