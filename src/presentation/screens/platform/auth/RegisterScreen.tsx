import React, { useCallback, useMemo } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import {
  Text,
  Button,
  Card,
  useTheme,
  IconButton,
} from "react-native-paper";
import { useSnackbar } from "@/presentation/components/feedback/SnackbarProvider";
import { Formik } from "formik";
import * as Yup from "yup";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/presentation/navigation/types";
import { useRegister } from "@/application/auth/hooks/useRegister";
import { CurrencyType } from "@/domain/types/CurrencyType";
import { GenderType } from "@/domain/types/GenderType";
import { PersonalInfoSection } from "./components/PersonalInfoSection";
import { CurrencySection } from "./components/CurrencySection";
import { useToggle } from "@/presentation/hooks/useToggle";

// Componente SectionTitle memoizado
const SectionTitle = React.memo(
  ({ title, subtitle }: { title: string; subtitle?: string }) => {
    const theme = useTheme();
    return (
      <View style={{ marginBottom: subtitle ? 6 : 12 }}>
        <Text variant="titleSmall" style={{ fontWeight: "600" }}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            variant="bodySmall"
            style={{ color: theme.colors.onSurfaceVariant, marginTop: 2, letterSpacing: 0.2 }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    );
  }
);

interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: Date;
  gender: GenderType;
  currency: CurrencyType;
}

const validationSchema = Yup.object().shape({
  fullName: Yup.string()
    .min(2, "Debe tener al menos 2 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "Solo se permiten letras y espacios")
    .required("El nombre completo es requerido"),
  email: Yup.string()
    .email("Ingresa un email válido")
    .required("El email es requerido"),
  password: Yup.string()
    .min(6, "Debe tener al menos 6 caracteres")
    .matches(/^(?=.*[a-zA-Z])(?=.*\d).+$/, "Debe contener al menos una letra y un número")
    .required("La contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
  birthDate: Yup.date()
    .max(new Date(), "La fecha no puede ser futura")
    .test("age", "Debes tener al menos 13 años", function (value) {
      if (!value) return false;
      const today = new Date();
      const age = today.getFullYear() - value.getFullYear();
      const monthDiff = today.getMonth() - value.getMonth();
      return age > 13 || (age === 13 && monthDiff >= 0);
    })
    .required("La fecha de nacimiento es requerida"),
  gender: Yup.string()
    .oneOf(["male", "female"], "Selecciona un género válido")
    .required("Selecciona tu género"),
  currency: Yup.string()
    .oneOf(["PEN", "USD"], "Selecciona una moneda válida")
    .required("Selecciona tu moneda principal"),
});

const initialValues: RegisterFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  birthDate: new Date(2000, 0, 1),
  gender: "male",
  currency: "PEN",
};

export const RegisterScreen = ({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList, 'Register'> }) => {
  const theme = useTheme();
  const { register, loading } = useRegister();
  const { showSnackbar } = useSnackbar();
  const [showPassword, togglePassword] = useToggle(false);
  const [showConfirmPassword, toggleConfirmPassword] = useToggle(false);
  const [showDatePicker, , setShowDatePicker] = useToggle(false);
  const [isNavigating, , setIsNavigating] = useToggle(false);

  useFocusEffect(useCallback(() => { setIsNavigating(false); }, []));

  const formatDate = useCallback(
    (date: Date): string =>
      date.toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" }),
    []
  );

  const handleGoBack = useCallback(() => {
    if (isNavigating || loading) return;
    navigation.goBack();
  }, [isNavigating, loading, navigation]);

  const handleGoToLogin = useCallback(() => {
    if (isNavigating || loading) return;
    setIsNavigating(true);
    navigation.navigate("Login");
  }, [isNavigating, loading, navigation]);

  const handleSubmit = useCallback(
    async (values: RegisterFormData) => {
      try {
        await register({
          email: values.email.trim().toLowerCase(),
          password: values.password,
          fullName: values.fullName.trim(),
          gender: values.gender,
          birthDate: values.birthDate.toISOString().split('T')[0],
          currency: values.currency,
        });
        showSnackbar("¡Cuenta creada exitosamente! Bienvenido a Financify");
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error al crear la cuenta";
        showSnackbar(message, { type: 'error' });
      }
    },
    [register, showSnackbar]
  );

  const openDatePicker = useCallback(() => setShowDatePicker(true), [setShowDatePicker]);
  const closeDatePicker = useCallback(() => setShowDatePicker(false), [setShowDatePicker]);

  const styles = useMemo(
    () => ({
      container: { flex: 1, backgroundColor: theme.colors.background },
      headerContainer: {
        flexDirection: "row" as const, alignItems: "center" as const,
        paddingHorizontal: 20, paddingVertical: 12, backgroundColor: theme.colors.background,
      },
      headerTitle: {
        fontWeight: "600" as const, color: theme.colors.onBackground,
        flex: 1, textAlign: "center" as const, marginRight: 48,
      },
      keyboardView: { flex: 1, backgroundColor: theme.colors.background },
      scrollContent: { padding: 20, paddingTop: 10 },
      card: { borderRadius: 16, elevation: 3 },
      cardContent: { padding: 20 },
      inputContainer: { marginBottom: 2 },
      genderText: { marginBottom: 8, color: theme.colors.onBackground, fontWeight: "500" as const },
      genderSurface: { padding: 12, borderRadius: 10, backgroundColor: theme.colors.surfaceVariant },
      genderRow: { flexDirection: "row" as const, justifyContent: "space-around" as const },
      genderItem: { flexDirection: "row" as const, alignItems: "center" as const },
      currencyText: { marginBottom: 8, fontWeight: "500" as const, color: theme.colors.onBackground },
      currencyRow: { flexDirection: "row" as const, gap: 12, justifyContent: "space-between" as const },
      registerButton: { borderRadius: 10, marginBottom: 2 },
      registerButtonContent: { paddingVertical: 4 },
      registerButtonLabel: { fontSize: 15, fontWeight: "600" as const },
      loginContainer: { flexDirection: "row" as const, justifyContent: "center" as const, alignItems: "center" as const },
      loginText: { color: theme.colors.onSurfaceVariant, fontSize: 14 },
      loginButtonLabel: { fontSize: 14, fontWeight: "600" as const },
    }),
    [theme.colors]
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={handleGoBack}
          disabled={isNavigating || loading}
          style={{ opacity: isNavigating || loading ? 0.5 : 1 }}
        />
        <Text variant="titleLarge" style={styles.headerTitle}>
          Crear Cuenta
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit: formikSubmit, isValid }) => (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Card mode="elevated" style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <SectionTitle title="Datos personales" subtitle="Ingresa tu información básica" />

                  <PersonalInfoSection
                    values={values}
                    errors={errors as Record<string, string | undefined>}
                    touched={touched as Record<string, boolean | undefined>}
                    loading={loading}
                    showDatePicker={showDatePicker}
                    showPassword={showPassword}
                    showConfirmPassword={showConfirmPassword}
                    passwordValue={values.password}
                    confirmPasswordValue={values.confirmPassword}
                    handleChange={handleChange as (field: string) => (text: string) => void}
                    handleBlur={handleBlur as unknown as (field: string) => () => void}
                    setFieldValue={setFieldValue}
                    onTogglePassword={togglePassword}
                    onToggleConfirmPassword={toggleConfirmPassword}
                    onOpenDatePicker={openDatePicker}
                    onCloseDatePicker={closeDatePicker}
                    formatDate={formatDate}
                    styles={styles}
                  />

                  <SectionTitle title="Preferencias" subtitle="Elige cómo quieres visualizar tus finanzas" />

                  <CurrencySection
                    selectedCurrency={values.currency}
                    onSelect={(code) => setFieldValue("currency", code)}
                    styles={styles}
                  />

                  <Button
                    mode="contained"
                    onPress={() => formikSubmit()}
                    loading={loading}
                    disabled={loading || !isValid}
                    icon="account-plus"
                    style={styles.registerButton}
                    labelStyle={styles.registerButtonLabel}
                    contentStyle={styles.registerButtonContent}
                  >
                    {loading ? "Creando cuenta..." : "Crear Cuenta"}
                  </Button>

                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
                    <Button
                      mode="text"
                      onPress={handleGoToLogin}
                      disabled={loading || isNavigating}
                      labelStyle={[styles.loginButtonLabel, { opacity: loading || isNavigating ? 0.5 : 1 }]}
                    >
                      Iniciar Sesión
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>
    </View>
  );
};
