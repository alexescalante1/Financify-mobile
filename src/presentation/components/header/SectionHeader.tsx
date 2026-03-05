import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(({
  title,
  actionLabel = 'Ver todo',
  onAction,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const titleStyle = useMemo(() => ({
    color: theme.colors.onSurface,
    fontWeight: '600' as const,
  }), [theme.colors.onSurface]);

  const actionColor = useMemo(() => ({
    color: theme.colors.primary,
  }), [theme.colors.primary]);

  return (
    <View style={[styles.container, style]} testID={testID} accessibilityLabel={accessibilityLabel}>
      <Text variant="titleMedium" style={titleStyle}>{title}</Text>
      {onAction ? (
        <Pressable onPress={onAction} style={({ pressed }) => [pressed && styles.pressed]}>
          <Text variant="labelLarge" style={actionColor}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});
SectionHeader.displayName = 'SectionHeader';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
