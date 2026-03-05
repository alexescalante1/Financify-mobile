import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FinancifyButton } from '@/presentation/components/button/FinancifyButton';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: string;
  onRetry?: () => void;
  retryLabel?: string;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = React.memo(({
  title = 'Ha ocurrido un error',
  message = 'Inténtalo de nuevo más tarde',
  icon = 'alert-circle-outline',
  onRetry,
  retryLabel = 'Reintentar',
  loading = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const descriptionStyle = useMemo(() => ({
    textAlign: 'center' as const,
    color: theme.colors.onSurfaceVariant,
    marginTop: 8,
  }), [theme.colors.onSurfaceVariant]);

  const handleRetry = useCallback(() => {
    onRetry?.();
  }, [onRetry]);

  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <MaterialCommunityIcons
        name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={48}
        color={theme.colors.error}
        style={styles.icon}
      />
      <Text variant="titleLarge" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyLarge" style={descriptionStyle}>
        {message}
      </Text>
      {onRetry ? (
        <FinancifyButton
          title={retryLabel}
          variant="danger"
          size="md"
          onPress={handleRetry}
          loading={loading}
          style={styles.retryButton}
        />
      ) : null}
    </View>
  );
});
ErrorState.displayName = 'ErrorState';

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
  retryButton: {
    marginTop: 20,
  },
});
