import React, { useMemo } from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface LoadingScreenProps {
  message?: string;
  showSpinner?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = React.memo(({ 
  message = "Verificando sesión...",
  showSpinner = true 
}) => {
  const theme = useTheme();

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: theme.colors.background }
  ], [theme.colors.background]);

  const textStyle = useMemo(() => [
    styles.text,
    { color: theme.colors.onBackground }
  ], [theme.colors.onBackground]);

  return (
    <SafeAreaView style={containerStyle}>
      {showSpinner && (
        <ActivityIndicator 
          size="large" 
          color={theme.colors.primary}
          style={styles.spinner}
        />
      )}
      <Text variant="bodyLarge" style={textStyle}>
        {message}
      </Text>
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
  spinner: {
    marginBottom: 16,
  },
  text: {
    textAlign: "center",
    lineHeight: 24,
  },
});

export default LoadingScreen;