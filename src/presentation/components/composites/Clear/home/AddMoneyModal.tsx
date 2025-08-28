import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  TextInput,
  Button,
  Card,
  SegmentedButtons,
  Snackbar,
  HelperText,
  useTheme,
  Chip,
  Divider,
} from "react-native-paper";
import { useForm, Controller } from "react-hook-form";
import { useTransactions } from "@/application/hooks/useTransactions";
import { TransactionVo } from "@/domain/valueObjects/TransactionVo";
import { SmoothPopupFullScreen } from "@/presentation/components/widgets/screen/SmoothPopupFullScreen";

// ============= TYPES =============
interface AddMoneyModalProps {
  visible: boolean;
  onDismiss: () => void;
}

interface MoneyFormData {
  amount: string;
  description: string;
  type: "income" | "expense";
}

// ============= CONSTANTS =============
const QUICK_AMOUNTS = [10, 20, 50, 100, 200, 500];

const EXPENSE_SUGGESTIONS = [
  "Alimentación", "Transporte", "Servicios", "Entretenimiento", 
  "Compras", "Salud", "Educación", "Otros"
];

const INCOME_SUGGESTIONS = [
  "Salario", "Freelance", "Venta", "Inversión", 
  "Regalo", "Bono", "Dividendos", "Otros"
];

const VALIDATION_RULES = {
  MAX_AMOUNT: 999999.99,
  MIN_AMOUNT: 0,
  MAX_DESCRIPTION: 100,
  DECIMAL_REGEX: /^\d+(\.\d{1,2})?$/,
};

// ============= COMPONENT =============
export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  visible,
  onDismiss,
}) => {
  const theme = useTheme();
  const { addTransaction, loading } = useTransactions();

  // ============= STATE =============
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm<MoneyFormData>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      description: "",
      type: "expense",
    },
  });

  const transactionType = watch("type");
  const currentAmount = watch("amount");

  // ============= STYLES =============
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      marginBottom: 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: "600",
    },
    previewCard: {
      borderRadius: 16,
      elevation: 3,
      marginBottom: 24,
    },
    previewContent: {
      padding: 20,
      alignItems: "center",
    },
    previewAmount: {
      fontSize: 32,
      fontWeight: "bold",
      marginBottom: 4,
    },
    quickAmountsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    suggestionsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 12,
    },
    typeSelector: {
      backgroundColor: theme.colors.surfaceVariant + "30",
      borderRadius: 12,
      padding: 4,
    },
    infoContainer: {
      borderRadius: 12,
      marginBottom: 24,
    },
    footer: {
      flexDirection: "row",
      gap: 12,
      padding: 16,
      paddingTop: 12,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + "20",
    },
  });

  // ============= UTILITY FUNCTIONS =============
  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const validateAmount = (value: string) => {
    if (!value?.trim()) {
      return "El monto es requerido";
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return "Ingresa un monto válido";
    }

    if (numValue <= VALIDATION_RULES.MIN_AMOUNT) {
      return "El monto debe ser mayor a 0";
    }

    if (numValue > VALIDATION_RULES.MAX_AMOUNT) {
      return "El monto es demasiado grande";
    }

    if (!VALIDATION_RULES.DECIMAL_REGEX.test(value)) {
      return "Formato inválido (ej: 25.50)";
    }

    return true;
  };

  const getPreviewAmount = (): string => {
    const amount = parseFloat(currentAmount) || 0;
    const prefix = transactionType === "income" ? "+" : "-";
    return `${prefix}S/ ${amount.toFixed(2)}`;
  };

  const getPreviewColor = () => {
    return transactionType === "income" ? theme.colors.primary : theme.colors.error;
  };

  const handleQuickAmount = (amount: number) => {
    setValue("amount", amount.toString(), { shouldValidate: true });
  };

  const handleDescriptionSuggestion = (suggestion: string) => {
    setValue("description", suggestion);
  };

  const cleanAmountInput = (text: string): string => {
    const cleanText = text.replace(/[^0-9.]/g, "");
    const parts = cleanText.split(".");
    return parts.length <= 2 ? cleanText : parts[0] + "." + parts[1];
  };

  // ============= EVENT HANDLERS =============
  const onSubmit = async (data: MoneyFormData) => {
    try {
      const amount = parseFloat(data.amount);
      if (isNaN(amount) || amount <= 0) {
        showSnackbar("Por favor ingresa un monto válido");
        return;
      }

      const transactionData: TransactionVo = {
        type: data.type,
        amount: amount,
        description: data.description || (data.type === "income" ? "Ingreso" : "Gasto"),
      };

      await addTransaction(transactionData);

      const successMessage = `${data.type === "income" ? "Ingreso" : "Gasto"} registrado correctamente`;
      showSnackbar(successMessage);

      reset();
      setTimeout(() => {
        onDismiss();
      }, 100);
    } catch (error: any) {
      console.error("Error al registrar transacción:", error);
      showSnackbar(error.message || "Error al registrar la transacción");
    }
  };

  const handleDismiss = () => {
    if (!loading) {
      reset();
      onDismiss();
    }
  };

  // ============= RENDER =============
  return (
    <>
      <SmoothPopupFullScreen
        visible={visible}
        onDismiss={handleDismiss}
        backgroundColor={theme.colors.surface}
        title={transactionType === "income" ? "NUEVO INGRESO" : "NUEVO GASTO"}
      >
        <View style={styles.container}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Vista previa del monto */}
            <Card style={styles.previewCard}>
              <View style={styles.previewContent}>
                <Text
                  variant="bodyLarge"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                  }}
                >
                  {transactionType === "income" ? "Se agregará" : "Se descontará"}
                </Text>
                <Text
                  style={[styles.previewAmount, { color: getPreviewColor() }]}
                >
                  {getPreviewAmount()}
                </Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.onSurfaceVariant }}
                >
                  {transactionType === "income" ? "a tu balance" : "de tu balance"}
                </Text>
              </View>
            </Card>

            {/* Selector de tipo */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Tipo de movimiento
              </Text>
              <Controller
                control={control}
                name="type"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.typeSelector}>
                    <SegmentedButtons
                      value={value}
                      onValueChange={onChange}
                      buttons={[
                        {
                          value: "expense",
                          label: "Gasto",
                          icon: "trending-down",
                          disabled: loading,
                        },
                        {
                          value: "income",
                          label: "Ingreso",
                          icon: "trending-up",
                          disabled: loading,
                        },
                      ]}
                    />
                  </View>
                )}
              />
            </View>

            {/* Monto con botones rápidos */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Monto (S/)
              </Text>
              <Controller
                control={control}
                name="amount"
                rules={{ validate: validateAmount }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Cantidad"
                      value={value}
                      onChangeText={(text) => onChange(cleanAmountInput(text))}
                      onBlur={onBlur}
                      mode="outlined"
                      keyboardType="numeric"
                      left={<TextInput.Icon icon="currency-usd" />}
                      right={
                        value ? (
                          <TextInput.Icon
                            icon="close"
                            onPress={() => onChange("")}
                          />
                        ) : undefined
                      }
                      error={!!errors.amount}
                      placeholder="0.00"
                      disabled={loading}
                    />
                    <HelperText type="error" visible={!!errors.amount}>
                      {errors.amount?.message}
                    </HelperText>
                  </>
                )}
              />

              {/* Montos rápidos */}
              <View>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    marginTop: 8,
                  }}
                >
                  Montos frecuentes
                </Text>
                <View style={styles.quickAmountsContainer}>
                  {QUICK_AMOUNTS.map((amount) => (
                    <Chip
                      key={amount}
                      mode="outlined"
                      onPress={() => handleQuickAmount(amount)}
                      disabled={loading}
                      compact
                    >
                      S/ {amount}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>

            <Divider style={{ marginVertical: 8 }} />

            {/* Descripción con sugerencias */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Descripción
              </Text>
              <Controller
                control={control}
                name="description"
                rules={{
                  maxLength: {
                    value: VALIDATION_RULES.MAX_DESCRIPTION,
                    message: `La descripción no puede exceder ${VALIDATION_RULES.MAX_DESCRIPTION} caracteres`,
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="¿Para qué fue este movimiento?"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      left={<TextInput.Icon icon="tag-outline" />}
                      right={
                        value ? (
                          <TextInput.Icon
                            icon="close"
                            onPress={() => onChange("")}
                          />
                        ) : undefined
                      }
                      placeholder={`Ejemplo: ${
                        transactionType === "income" ? "Salario del mes" : "Almuerzo"
                      }`}
                      disabled={loading}
                      multiline
                      numberOfLines={2}
                    />
                    <HelperText type="error" visible={!!errors.description}>
                      {errors.description?.message}
                    </HelperText>
                    <HelperText type="info" visible={!!value}>
                      {value?.length || 0}/{VALIDATION_RULES.MAX_DESCRIPTION} caracteres
                    </HelperText>
                  </>
                )}
              />

              {/* Sugerencias de descripción */}
              <View>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    marginTop: 8,
                  }}
                >
                  Sugerencias
                </Text>
                <View style={styles.suggestionsContainer}>
                  {(transactionType === "income" ? INCOME_SUGGESTIONS : EXPENSE_SUGGESTIONS).map((suggestion) => (
                    <Chip
                      key={suggestion}
                      mode="outlined"
                      onPress={() => handleDescriptionSuggestion(suggestion)}
                      disabled={loading}
                      compact
                      icon={transactionType === "income" ? "plus" : "minus"}
                    >
                      {suggestion}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>

            {/* Información adicional */}
            <View
              style={[
                styles.infoContainer,
                {
                  backgroundColor:
                    transactionType === "income"
                      ? theme.colors.primaryContainer
                      : theme.colors.errorContainer,
                  padding: 16,
                },
              ]}
            >
              <Text
                variant="bodyMedium"
                style={{
                  color:
                    transactionType === "income"
                      ? theme.colors.onPrimaryContainer
                      : theme.colors.onErrorContainer,
                  textAlign: "center",
                  fontWeight: "500",
                }}
              >
                {transactionType === "income"
                  ? "Este ingreso se sumará a tu balance total"
                  : "Este gasto se restará de tu balance total"}
              </Text>
            </View>
          </ScrollView>

          {/* Footer mejorado */}
          <View style={styles.footer}>
            <Button
              mode="outlined"
              onPress={handleDismiss}
              style={{ flex: 1 }}
              disabled={loading}
              icon="close"
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={loading || !isValid}
              style={{ flex: 1 }}
              buttonColor={getPreviewColor()}
              icon={transactionType === "income" ? "plus" : "minus"}
            >
              {loading ? "Guardando..." : "Registrar"}
            </Button>
          </View>
        </View>
      </SmoothPopupFullScreen>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
        style={{
          backgroundColor: transactionType === "income" 
            ? theme.colors.primaryContainer 
            : theme.colors.errorContainer,
        }}
      >
        <Text style={{
          color: transactionType === "income" 
            ? theme.colors.onPrimaryContainer 
            : theme.colors.onErrorContainer,
        }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </>
  );
};