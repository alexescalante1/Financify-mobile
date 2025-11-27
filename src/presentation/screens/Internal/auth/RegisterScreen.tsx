import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  Snackbar,
  HelperText,
  RadioButton,
  Surface,
  useTheme,
  IconButton,
} from "react-native-paper";
import { Formik } from "formik";
import * as Yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { useRegister } from "@/application/hooks/auth/useRegister";
import { CurrencyType } from "@/domain/types/CurrencyType";
import { GenderType } from "@/domain/types/GenderType";

// Componente SectionTitle memoizado
const SectionTitle = React.memo(
  ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <View style={{ marginBottom: subtitle ? 6 : 12 }}>
      <Text variant="titleSmall" style={{ fontWeight: "600" }}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="bodySmall"
          style={{ color: "#8a8a8a", marginTop: 2, letterSpacing: 0.2 }}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  )
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

// Schema y valores iniciales fuera del componente
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
    .matches(
      /^(?=.*[a-zA-Z])(?=.*\d).+$/,
      "Debe contener al menos una letra y un número"
    )
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
    .oneOf(["masculino", "femenino"], "Selecciona un género válido")
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
  gender: "masculino",
  currency: "PEN",
};

const CURRENCIES = [
  {
    code: "PEN" as CurrencyType,
    name: "Soles Peruanos",
    symbol: "S/",
    flag: "🇵🇪",
  },
  {
    code: "USD" as CurrencyType,
    name: "Dólares Americanos",
    symbol: "$",
    flag: "🇺🇸",
  },
];

const GENDERS: GenderType[] = ["masculino", "femenino"];

export const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const theme = useTheme();
  const { register, loading, error } = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const formatDate = useCallback(
    (date: Date): string =>
      date.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
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
          birthDate: values.birthDate,
          currency: values.currency,
        });

        showSnackbar("¡Cuenta creada exitosamente! Bienvenido a Financify");
      } catch (error: any) {
        showSnackbar(error.message || "Error al crear la cuenta");
      }
    },
    [register, showSnackbar]
  );

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword((prev) => !prev);
  }, []);

  const openDatePicker = useCallback(() => {
    setShowDatePicker(true);
  }, []);

  const closeDatePicker = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  // Estilos memoizados
  const styles = useMemo(
    () => ({
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      headerContainer: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
        paddingHorizontal: 20,
        paddingVertical: 12,
        backgroundColor: theme.colors.background,
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
        backgroundColor: theme.colors.background,
      },
      scrollContent: {
        padding: 20,
        paddingTop: 10,
      },
      card: {
        borderRadius: 16,
        elevation: 3,
      },
      cardContent: {
        padding: 20,
      },
      inputContainer: {
        marginBottom: 2,
      },
      genderText: {
        marginBottom: 8,
        color: theme.colors.onBackground,
        fontWeight: "500" as const,
      },
      genderSurface: {
        padding: 12,
        borderRadius: 10,
        backgroundColor: theme.colors.surfaceVariant,
      },
      genderRow: {
        flexDirection: "row" as const,
        justifyContent: "space-around" as const,
      },
      genderItem: {
        flexDirection: "row" as const,
        alignItems: "center" as const,
      },
      currencyText: {
        marginBottom: 8,
        fontWeight: "500" as const,
        color: theme.colors.onBackground,
      },
      currencyRow: {
        flexDirection: "row" as const,
        gap: 12,
        justifyContent: "space-between" as const,
      },
      registerButton: {
        borderRadius: 10,
        marginBottom: 2,
      },
      registerButtonContent: {
        paddingVertical: 4,
      },
      registerButtonLabel: {
        fontSize: 15,
        fontWeight: "600" as const,
      },
      loginContainer: {
        flexDirection: "row" as const,
        justifyContent: "center" as const,
        alignItems: "center" as const,
      },
      loginText: {
        color: theme.colors.onSurfaceVariant,
        fontSize: 14,
      },
      loginButtonLabel: {
        fontSize: 14,
        fontWeight: "600" as const,
      },
    }),
    [theme.colors]
  );

  // Función para renderizar el botón de moneda
  const renderCurrencyButton = useCallback(
    (
      currency: typeof CURRENCIES[0],
      isSelected: boolean,
      onPress: () => void
    ) => (
      <TouchableOpacity
        key={currency.code}
        onPress={onPress}
        style={{
          flex: 1,
          backgroundColor: isSelected
            ? theme.colors.primaryContainer
            : theme.colors.surfaceVariant,
          borderColor: isSelected
            ? theme.colors.primary
            : theme.colors.outline,
          borderWidth: 2,
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
          elevation: isSelected ? 2 : 0,
        }}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 24, marginBottom: 4 }}>{currency.flag}</Text>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: isSelected ? theme.colors.primary : theme.colors.onSurface,
            marginBottom: 2,
          }}
        >
          {currency.symbol}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: isSelected
              ? theme.colors.primary
              : theme.colors.onSurfaceVariant,
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {currency.code}
        </Text>
      </TouchableOpacity>
    ),
    [theme.colors]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
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
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            setFieldValue,
            handleSubmit: formikSubmit,
            isValid,
          }) => (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <Card mode="elevated" style={styles.card}>
                <Card.Content style={styles.cardContent}>
                  <SectionTitle
                    title="Datos personales"
                    subtitle="Ingresa tu información básica"
                  />

                  {/* Nombre */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Nombre Completo"
                      value={values.fullName}
                      onChangeText={handleChange("fullName")}
                      onBlur={handleBlur("fullName")}
                      mode="outlined"
                      autoCapitalize="words"
                      error={!!(touched.fullName && errors.fullName)}
                      left={<TextInput.Icon icon="account" />}
                      editable={!loading}
                    />
                    <HelperText
                      type="error"
                      visible={!!(touched.fullName && errors.fullName)}
                    >
                      {errors.fullName}
                    </HelperText>
                  </View>

                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Correo Electrónico"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      error={!!(touched.email && errors.email)}
                      left={<TextInput.Icon icon="email" />}
                      editable={!loading}
                    />
                    <HelperText
                      type="error"
                      visible={!!(touched.email && errors.email)}
                    >
                      {errors.email}
                    </HelperText>
                  </View>

                  {/* Contraseña */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Contraseña"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      mode="outlined"
                      secureTextEntry={!showPassword}
                      error={!!(touched.password && errors.password)}
                      left={<TextInput.Icon icon="lock" />}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? "eye-off" : "eye"}
                          onPress={togglePassword}
                        />
                      }
                      editable={!loading}
                    />
                    <HelperText
                      type="error"
                      visible={!!(touched.password && errors.password)}
                    >
                      {errors.password}
                    </HelperText>
                  </View>

                  {/* Confirmar Contraseña */}
                  <View style={styles.inputContainer}>
                    <TextInput
                      label="Confirmar Contraseña"
                      value={values.confirmPassword}
                      onChangeText={handleChange("confirmPassword")}
                      onBlur={handleBlur("confirmPassword")}
                      mode="outlined"
                      secureTextEntry={!showConfirmPassword}
                      error={
                        !!(touched.confirmPassword && errors.confirmPassword)
                      }
                      left={<TextInput.Icon icon="lock-check" />}
                      right={
                        <TextInput.Icon
                          icon={showConfirmPassword ? "eye-off" : "eye"}
                          onPress={toggleConfirmPassword}
                        />
                      }
                      editable={!loading}
                    />
                    <HelperText
                      type="error"
                      visible={
                        !!(touched.confirmPassword && errors.confirmPassword)
                      }
                    >
                      {errors.confirmPassword}
                    </HelperText>
                  </View>

                  {/* Fecha Nacimiento */}
                  <View style={styles.inputContainer}>
                    <TouchableOpacity
                      onPress={openDatePicker}
                      activeOpacity={0.8}
                      disabled={loading}
                    >
                      <TextInput
                        label="Fecha de Nacimiento"
                        value={formatDate(values.birthDate)}
                        mode="outlined"
                        editable={false}
                        pointerEvents="none"
                        left={<TextInput.Icon icon="calendar" />}
                        right={<TextInput.Icon icon="calendar-edit" />}
                        error={!!(touched.birthDate && errors.birthDate)}
                      />
                    </TouchableOpacity>
                    <HelperText
                      type="error"
                      visible={!!(touched.birthDate && errors.birthDate)}
                    >
                      {errors.birthDate as string}
                    </HelperText>
                  </View>

                  {/* Género */}
                  <View style={styles.inputContainer}>
                    <Text variant="bodyLarge" style={styles.genderText}>
                      Género
                    </Text>
                    <Surface style={styles.genderSurface} elevation={1}>
                      <RadioButton.Group
                        onValueChange={(value) =>
                          setFieldValue("gender", value)
                        }
                        value={values.gender}
                      >
                        <View style={styles.genderRow}>
                          {GENDERS.map((g) => (
                            <View key={g} style={styles.genderItem}>
                              <RadioButton value={g} disabled={loading} />
                              <Text
                                style={{ color: theme.colors.onBackground }}
                              >
                                {g.charAt(0).toUpperCase() + g.slice(1)}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </RadioButton.Group>
                    </Surface>
                  </View>

                  <SectionTitle
                    title="Preferencias"
                    subtitle="Elige cómo quieres visualizar tus finanzas"
                  />

                  {/* Moneda */}
                  <View style={{ marginBottom: 16 }}>
                    <Text variant="bodyLarge" style={styles.currencyText}>
                      Moneda Principal
                    </Text>

                    <View style={styles.currencyRow}>
                      {CURRENCIES.map((currency) =>
                        renderCurrencyButton(
                          currency,
                          values.currency === currency.code,
                          () => setFieldValue("currency", currency.code)
                        )
                      )}
                    </View>

                    <HelperText type="info" visible={true}>
                      Esta será tu moneda por defecto para ingresos y gastos
                    </HelperText>
                  </View>

                  {/* Botón Registro */}
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

                  {/* Ya tienes cuenta */}
                  <View style={styles.loginContainer}>
                    <Text style={styles.loginText}>
                      ¿Ya tienes cuenta?{" "}
                    </Text>
                    <Button
                      mode="text"
                      onPress={handleGoToLogin}
                      disabled={loading || isNavigating}
                      labelStyle={[
                        styles.loginButtonLabel,
                        { opacity: loading || isNavigating ? 0.5 : 1 },
                      ]}
                    >
                      Iniciar Sesión
                    </Button>
                  </View>
                </Card.Content>
              </Card>

              {/* Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={values.birthDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    closeDatePicker();
                    if (selectedDate) setFieldValue("birthDate", selectedDate);
                  }}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                />
              )}
            </ScrollView>
          )}
        </Formik>
      </KeyboardAvoidingView>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={dismissSnackbar}
        duration={4000}
        action={{ label: "OK", onPress: dismissSnackbar }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};