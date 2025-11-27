import React, { useState, useCallback, useMemo } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Avatar,
  Snackbar,
  HelperText,
  useTheme,
  IconButton,
} from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/application/hooks/useAuth";
import { useFocusEffect } from "@react-navigation/native";
import { OptimizedParticlesBackground } from "@/presentation/components/widgets/animated/OptimizedParticlesBackground";

interface LoginFormData {
  email: string;
  password: string;
}

// Esquema de validación con Yup (fuera del componente para evitar recreación)
const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Ingresa un email válido")
    .required("El email es requerido"),
  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
});

// Valores iniciales (fuera del componente)
const initialValues: LoginFormData = {
  email: "",
  password: "",
};

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const { login, loginWithGoogle, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  // Memoizar colores del tema
  const labelColors = useMemo(
    () => ({
      colors: {
        onSurfaceVariant: theme.colors.onBackground,
        primary: theme.colors.primary,
      },
    }),
    [theme.colors.onBackground, theme.colors.primary]
  );

  // Reset navigation state when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsNavigating(false);
    }, [])
  );

  // Memoizar función showSnackbar
  const showSnackbar = useCallback((message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  }, []);

  // Memoizar handlers
  const handleGoogleLogin = useCallback(async () => {
    try {
      await loginWithGoogle();
      showSnackbar("Autenticado con Google!");
    } catch (error: any) {
      showSnackbar(error?.message || "Error al iniciar sesión con Google");
    }
  }, [loginWithGoogle, showSnackbar]);

  const onSubmit = useCallback(
    async (values: LoginFormData) => {
      try {
        await login(values.email.trim().toLowerCase(), values.password);
        showSnackbar("¡Bienvenido de vuelta!");
      } catch (error: any) {
        showSnackbar(error.message || "Error al iniciar sesión");
      }
    },
    [login, showSnackbar]
  );

  const handleGoBack = useCallback(() => {
    if (isNavigating || authLoading) return;
    navigation.goBack();
  }, [isNavigating, authLoading, navigation]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleForgotPassword = useCallback(() => {
    showSnackbar("Función próximamente");
  }, [showSnackbar]);

  const navigateToRegister = useCallback(() => {
    if (!isNavigating) {
      navigation.navigate("Register");
    }
  }, [isNavigating, navigation]);

  const dismissSnackbar = useCallback(() => {
    setSnackbarVisible(false);
  }, []);

  // Memoizar estilos estáticos
  const styles = useMemo(
    () => ({
      headerContainer: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: "transparent",
        elevation: 0,
      },
      backButton: {
        backgroundColor: theme.colors.surface,
        borderRadius: 20,
        elevation: 2,
      },
      headerTitle: {
        fontWeight: "600" as const,
        color: theme.colors.onBackground,
        flex: 1,
        textAlign: "center" as const,
        marginRight: 48,
      },
      keyboardView: {
        flex: 1,
        backgroundColor: "transparent",
      },
      scrollContent: {
        flexGrow: 1,
        padding: 20,
        justifyContent: "center" as const,
        paddingTop: 0,
      },
      card: {
        borderRadius: 16,
        elevation: 3,
        backgroundColor: theme.colors.surface,
      },
      cardContent: {
        padding: 20,
      },
      logoContainer: {
        alignItems: "center" as const,
        marginBottom: 16,
      },
      avatar: {
        backgroundColor: theme.colors.primary,
        elevation: 3,
        marginBottom: 8,
      },
      subtitle: {
        textAlign: "center" as const,
        color: theme.colors.onSurfaceVariant,
      },
      googleContainer: {
        marginBottom: 12,
        backgroundColor: theme.colors.surfaceVariant,
        borderRadius: 12,
        padding: 12,
      },
      googleButton: {
        borderRadius: 10,
        marginBottom: 6,
      },
      googleButtonContent: {
        paddingVertical: 4,
      },
      googleButtonLabel: {
        fontSize: 14,
        fontWeight: "600" as const,
      },
      dividerText: {
        textAlign: "center" as const,
        color: theme.colors.onSurfaceVariant,
        fontSize: 13,
      },
      forgotButton: {
        alignSelf: "flex-end" as const,
        marginBottom: 12,
      },
      forgotButtonLabel: {
        fontSize: 13,
      },
      loginButton: {
        borderRadius: 10,
        marginBottom: 2,
      },
      loginButtonContent: {
        paddingVertical: 4,
      },
      loginButtonLabel: {
        fontSize: 15,
        fontWeight: "600" as const,
      },
      registerContainer: {
        flexDirection: "row" as const,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      },
      registerText: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 14,
      },
      registerButtonLabel: {
        fontSize: 14,
        fontWeight: "600" as const,
      },
    }),
    [theme.colors]
  );

  return (
    <OptimizedParticlesBackground particleCount={6} enabled={true}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleGoBack}
          disabled={isNavigating}
          style={[
            styles.backButton,
            { opacity: isNavigating ? 0.5 : 1 },
          ]}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Iniciar Sesión
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          style={styles.keyboardView}
        >
          <Card mode="elevated" style={styles.card}>
            <Card.Content style={styles.cardContent}>
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Avatar.Icon size={64} icon="wallet" style={styles.avatar} />
                <Text variant="bodyMedium" style={styles.subtitle}>
                  Ingresa tus credenciales para continuar
                </Text>
              </View>

              {/* Google Login */}
              <View style={styles.googleContainer}>
                <Button
                  mode="contained-tonal"
                  onPress={handleGoogleLogin}
                  icon="google"
                  disabled={authLoading}
                  style={styles.googleButton}
                  labelStyle={styles.googleButtonLabel}
                  contentStyle={styles.googleButtonContent}
                >
                  Continuar con Google
                </Button>
                <Text style={styles.dividerText}>
                  o usa tu correo electrónico
                </Text>
              </View>

              {/* Formik */}
              <Formik
                initialValues={initialValues}
                validationSchema={loginValidationSchema}
                onSubmit={onSubmit}
                validateOnChange={false}
                validateOnBlur={true}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isValid,
                }) => (
                  <>
                    {/* Email */}
                    <TextInput
                      label="Correo electrónico"
                      theme={labelColors}
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      left={<TextInput.Icon icon="email" />}
                      error={!!(errors.email && touched.email)}
                      editable={!authLoading}
                    />
                    <HelperText
                      type="error"
                      visible={!!(errors.email && touched.email)}
                    >
                      {errors.email}
                    </HelperText>

                    {/* Contraseña */}
                    <TextInput
                      label="Contraseña"
                      theme={labelColors}
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      left={<TextInput.Icon icon="lock" />}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? "eye-off" : "eye"}
                          onPress={togglePasswordVisibility}
                        />
                      }
                      error={!!(errors.password && touched.password)}
                      editable={!authLoading}
                    />
                    <HelperText
                      type="error"
                      visible={!!(errors.password && touched.password)}
                    >
                      {errors.password}
                    </HelperText>

                    {/* Olvidaste contraseña */}
                    <Button
                      mode="text"
                      onPress={handleForgotPassword}
                      style={styles.forgotButton}
                      labelStyle={styles.forgotButtonLabel}
                      disabled={authLoading}
                    >
                      ¿Olvidaste tu contraseña?
                    </Button>

                    {/* Login */}
                    <Button
                      mode="contained"
                      onPress={() => handleSubmit()}
                      loading={authLoading}
                      disabled={authLoading || !isValid}
                      style={styles.loginButton}
                      labelStyle={styles.loginButtonLabel}
                      icon="login"
                      contentStyle={styles.loginButtonContent}
                    >
                      {authLoading ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>

                    {/* Registro */}
                    <View style={styles.registerContainer}>
                      <Text style={styles.registerText}>
                        ¿No tienes cuenta?{" "}
                      </Text>
                      <Button
                        mode="text"
                        onPress={navigateToRegister}
                        disabled={isNavigating}
                        labelStyle={[
                          styles.registerButtonLabel,
                          { opacity: isNavigating ? 0.5 : 1 },
                        ]}
                      >
                        Regístrate
                      </Button>
                    </View>
                  </>
                )}
              </Formik>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

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