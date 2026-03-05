import React, { Component, ErrorInfo, ReactNode, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  title?: string;
  message?: string;
  retryLabel?: string;
  testID?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_RETRIES = 3;

const DefaultFallback: React.FC<{
  title: string;
  message: string;
  retryLabel: string;
  error: Error | null;
  retryCount: number;
  onRetry: () => void;
  testID?: string;
}> = React.memo(({ title, message, retryLabel, error, retryCount, onRetry, testID }) => {
  const theme = useTheme();
  const canRetry = retryCount < MAX_RETRIES;

  const titleStyle = useMemo(() => ({ color: theme.colors.onSurface }), [theme.colors.onSurface]);
  const subtextStyle = useMemo(() => ({ color: theme.colors.onSurfaceVariant }), [theme.colors.onSurfaceVariant]);

  return (
    <View style={styles.container} testID={testID}>
      <MaterialCommunityIcons name="alert-circle-outline" size={64} color={theme.colors.error} />
      <Text variant="titleLarge" style={[styles.title, titleStyle]}>{title}</Text>
      <Text variant="bodyMedium" style={[styles.message, subtextStyle]}>{message}</Text>
      {__DEV__ && error ? (
        <Text variant="bodySmall" style={[styles.errorDetail, subtextStyle]} numberOfLines={4}>
          {error.message}
        </Text>
      ) : null}
      {canRetry ? (
        <Button mode="contained" onPress={onRetry} style={styles.button} buttonColor={theme.colors.primary}>
          {retryLabel}
        </Button>
      ) : (
        <Text variant="bodySmall" style={subtextStyle}>
          Se alcanzó el límite de reintentos
        </Text>
      )}
    </View>
  );
});
DefaultFallback.displayName = 'DefaultFallback';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  static displayName = 'ErrorBoundary';
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState(prev => ({
      hasError: false,
      error: null,
      retryCount: prev.retryCount + 1,
    }));
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const {
      title = 'Algo salió mal',
      message = 'Ha ocurrido un error inesperado. Intenta de nuevo.',
      retryLabel = 'Reintentar',
      testID,
    } = this.props;

    return (
      <DefaultFallback
        title={title}
        message={message}
        retryLabel={retryLabel}
        error={this.state.error}
        retryCount={this.state.retryCount}
        onRetry={this.handleRetry}
        testID={testID}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
  errorDetail: {
    fontFamily: 'monospace',
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 8,
  },
});
