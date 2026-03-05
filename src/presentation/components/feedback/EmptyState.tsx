import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FinancifyButton } from '@/presentation/components/button/FinancifyButton';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  iconSize?: number;
  iconColor?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  iconSize = 48,
  iconColor,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const resolvedIconColor = iconColor || theme.colors.onSurfaceVariant;

  const descriptionStyle = useMemo(() => ({
    textAlign: 'center' as const,
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
  }), [theme.colors.onSurfaceVariant]);

  const handleAction = useCallback(() => {
    onAction?.();
  }, [onAction]);

  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <MaterialCommunityIcons
        name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={iconSize}
        color={resolvedIconColor}
        style={styles.icon}
      />
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodyLarge" style={descriptionStyle}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <FinancifyButton
          title={actionLabel}
          variant="primary"
          size="md"
          onPress={handleAction}
          style={styles.actionButton}
        />
      ) : null}
    </View>
  );
});
EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  actionButton: {
    marginTop: 20,
  },
});
