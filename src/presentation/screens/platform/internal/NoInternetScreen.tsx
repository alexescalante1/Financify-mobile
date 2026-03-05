import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme, Text, Button, Card, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface NoInternetScreenProps {
  onRetry: () => void;
  title?: string;
  description?: string;
  showOfflineMode?: boolean;
  retryButtonText?: string;
}

const NoInternetScreen: React.FC<NoInternetScreenProps> = React.memo(({
  onRetry,
  title = "Sin conexión a internet",
  description = "Verifica tu conexión WiFi o datos móviles e inténtalo de nuevo",
  showOfflineMode = true,
  retryButtonText = "Reintentar"
}) => {
  const theme = useTheme();

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const iconStyle = useMemo(() => [
    styles.icon,
    { backgroundColor: theme.colors.errorContainer }
  ], [theme.colors.errorContainer]);

  const titleStyle = useMemo(() => [
    styles.title,
    { color: theme.colors.onBackground }
  ], [theme.colors.onBackground]);

  const descriptionStyle = useMemo(() => [
    styles.description,
    { color: theme.colors.onSurfaceVariant }
  ], [theme.colors.onSurfaceVariant]);

  const offlineModeStyle = useMemo(() => [
    styles.offlineMode,
    { color: theme.colors.onSurfaceVariant }
  ], [theme.colors.onSurfaceVariant]);

  return (
    <SafeAreaView style={containerStyle}>
      <Card mode="elevated" style={styles.card}>
        <Card.Content style={styles.cardContent}>
          <Avatar.Icon
            size={80}
            icon="wifi-off"
            style={iconStyle}
          />

          <Text variant="headlineSmall" style={titleStyle}>
            {title}
          </Text>

          <Text variant="bodyLarge" style={descriptionStyle}>
            {description}
          </Text>

          <Button
            mode="contained"
            onPress={onRetry}
            icon="refresh"
            style={styles.retryButton}
            labelStyle={styles.retryButtonLabel}
            contentStyle={styles.retryButtonContent}
          >
            {retryButtonText}
          </Button>

          {showOfflineMode && (
            <Text variant="bodySmall" style={offlineModeStyle}>
              Puedes seguir usando la app con funcionalidad limitada
            </Text>
          )}
        </Card.Content>
      </Card>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
  },
  cardContent: {
    padding: 32,
    alignItems: "center",
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    borderRadius: 10,
    marginBottom: 16,
  },
  retryButtonLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  retryButtonContent: {
    paddingVertical: 4,
  },
  offlineMode: {
    textAlign: "center",
  },
});

export default NoInternetScreen;