import React, { useState, useCallback, useMemo } from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  Button,
  Card,
  Avatar,
  Snackbar,
  useTheme,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { OptimizedParticlesBackground } from "@/presentation/components/widgets/animated/OptimizedParticlesBackground";
import { useAuth } from "@/application/hooks/useAuth";

// Constantes fuera del componente
const FEATURES = [
  { icon: "chart-line", text: "Reportes detallados" },
  { icon: "shield-check", text: "Datos seguros" },
  { icon: "clock-fast", text: "Acceso rápido" },
] as const;

// Componente de Feature memoizado
const FeatureItem = React.memo(
  ({
    icon,
    text,
    backgroundColor,
    textColor,
  }: {
    icon: string;
    text: string;
    backgroundColor: string;
    textColor: string;
  }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Avatar.Icon
        size={40}
        icon={icon}
        style={{
          backgroundColor,
        }}
      />
      <Text
        style={{
          color: textColor,
          fontSize: 16,
        }}
      >
        {text}
      </Text>
    </View>
  )
);

export const WelcomeScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const { loginWithGoogle, loading } = useAuth();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  // Reset navigation state when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  // Callbacks memoizados
  const showSnackbar = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  const dismissSnackbar = useCallback(() => {
    setSnackbarVisible(false);
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    if (isNavigating || loading) return;
    try {
      await loginWithGoogle();
    } catch (error: any) {
      showSnackbar(error?.message || "Error al ingresar con Google");
    }
  }, [isNavigating, loading, loginWithGoogle, showSnackbar]);

  const handleEmailLogin = useCallback(() => {
    if (isNavigating) return;
    setIsNavigating(true);
    navigation.navigate("Login");
  }, [isNavigating, navigation]);

  // Estilos memoizados
  const styles = useMemo(
    () => ({
      container: {
        flex: 1,
      },
      scrollContainer: {
        backgroundColor: "transparent",
      },
      scrollContent: {
        flexGrow: 1,
        padding: 20,
        justifyContent: "center" as const,
      },
      headerContainer: {
        alignItems: "center" as const,
        marginBottom: 48,
      },
      avatar: {
        backgroundColor: theme.colors.primary,
        elevation: 6,
        marginBottom: 24,
      },
      title: {
        fontWeight: "bold" as const,
        textAlign: "center" as const,
        marginBottom: 8,
        color: theme.colors.onBackground,
      },
      subtitle: {
        textAlign: "center" as const,
        color: theme.colors.onSurfaceVariant,
        paddingHorizontal: 20,
        lineHeight: 24,
      },
      featuresContainer: {
        alignItems: "center" as const,
        marginBottom: 32,
      },
      featuresTitle: {
        color: theme.colors.onBackground,
        marginBottom: 16,
        fontWeight: "600" as const,
      },
      featuresList: {
        gap: 12,
        paddingHorizontal: 20,
      },
      footerCard: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        margin: 0,
      },
      cardContent: {
        padding: 20,
        paddingBottom: 32,
        backgroundColor: "transparent",
      },
      buttonsContainer: {
        gap: 10,
      },
      googleButton: {
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
      },
      googleButtonContent: {
        flexDirection: "row-reverse" as const,
        paddingVertical: 4,
        paddingHorizontal: 16,
      },
      googleButtonLabel: {
        fontSize: 14,
        fontWeight: "600" as const,
      },
      emailButton: {
        borderRadius: 10,
      },
      emailButtonContent: {
        paddingVertical: 4,
        paddingHorizontal: 16,
      },
      emailButtonLabel: {
        fontSize: 14,
        fontWeight: "600" as const,
      },
    }),
    [theme.colors]
  );

  return (
    <OptimizedParticlesBackground particleCount={12}>
      <View style={styles.container}>
        {/* Contenido superior */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          style={styles.scrollContainer}
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Avatar.Icon size={120} icon="wallet" style={styles.avatar} />
            <Text variant="headlineLarge" style={styles.title}>
              Finanzify
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Controla tus ingresos y gastos de forma inteligente
            </Text>
          </View>

          {/* Features */}
          <View style={styles.featuresContainer}>
            <Text variant="titleMedium" style={styles.featuresTitle}>
              ¿Por qué elegir nuestra app?
            </Text>

            <View style={styles.featuresList}>
              {FEATURES.map((feature, index) => (
                <FeatureItem
                  key={index}
                  icon={feature.icon}
                  text={feature.text}
                  backgroundColor={theme.colors.primaryContainer}
                  textColor={theme.colors.onSurface}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <Card mode="elevated" style={styles.footerCard}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.buttonsContainer}>
              {/* Botón Google */}
              <Button
                mode="contained"
                onPress={handleGoogleLogin}
                disabled={isNavigating || loading}
                loading={loading}
                style={[
                  styles.googleButton,
                  { opacity: isNavigating || loading ? 0.7 : 1 },
                ]}
                labelStyle={styles.googleButtonLabel}
                icon="google"
                contentStyle={styles.googleButtonContent}
              >
                Continuar con Google
              </Button>

              {/* Botón Email */}
              <Button
                mode="outlined"
                onPress={handleEmailLogin}
                loading={isNavigating}
                disabled={isNavigating}
                style={[
                  styles.emailButton,
                  { opacity: isNavigating ? 0.7 : 1 },
                ]}
                labelStyle={styles.emailButtonLabel}
                icon="email"
                contentStyle={styles.emailButtonContent}
              >
                {isNavigating ? "Cargando..." : "Continuar con Email"}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={dismissSnackbar}
        duration={4000}
        action={{
          label: "OK",
          onPress: dismissSnackbar,
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </OptimizedParticlesBackground>
  );
};