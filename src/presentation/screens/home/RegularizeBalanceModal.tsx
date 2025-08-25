import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Snackbar,
  HelperText,
  useTheme,
  Divider,
  Chip,
  IconButton,
} from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { SmoothPopupFullScreen } from '@/presentation/components/common/screen/SmoothPopupFullScreen';
import { SimpleCard } from '@/presentation/components/common/card/SimpleCard';

// ============= TYPES =============
interface RegularizeBalanceModalProps {
  visible: boolean;
  onDismiss: () => void;
  currentBalance: number;
  onRegularize: (targetBalance: number, description?: string) => Promise<void>;
  loading: boolean;
}

interface RegularizeFormData {
  targetBalance: string;
  description: string;
}

interface DifferenceData {
  difference: number;
  absoluteDifference: number;
  type: 'income' | 'expense' | 'none';
  hasChange: boolean;
}

// ============= CONSTANTS =============
const QUICK_ADJUSTMENTS = [-100, -50, -10, 0, 10, 50, 100];

const VALIDATION_RULES = {
  MIN_BALANCE: -999999.99,
  MAX_BALANCE: 999999.99,
  MAX_DESCRIPTION: 100,
  DECIMAL_REGEX: /^-?\d+(\.\d{1,2})?$/,
};

const DESCRIPTION_SUGGESTIONS = [
  "Efectivo en billetera",
  "Dinero encontrado",
  "Gasto no registrado", 
  "Transferencia externa",
  "Ajuste de saldo",
  "Corrección de error"
];

// ============= COMPONENT =============
export const RegularizeBalanceModal: React.FC<RegularizeBalanceModalProps> = ({ 
  visible, 
  onDismiss, 
  currentBalance,
  onRegularize,
  loading 
}) => {
  const theme = useTheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm<RegularizeFormData>({
    mode: 'onChange',
    defaultValues: {
      targetBalance: currentBalance.toFixed(2),
      description: '',
    }
  });

  const targetBalanceValue = watch('targetBalance');

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
      marginBottom: 20,
    },
    sectionTitle: {
      marginBottom: 12,
      color: theme.colors.onSurfaceVariant,
      fontWeight: '600',
    },
    balanceDisplay: {
      alignItems: 'center',
      padding: 24,
    },
    currentBalance: {
      fontSize: 28,
      fontWeight: 'bold',
      color: currentBalance >= 0 ? theme.colors.primary : theme.colors.error,
    },
    adjustmentContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    suggestionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 12,
    },
    differenceCard: {
      padding: 20,
      alignItems: 'center',
    },
    differenceAmount: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    warningCard: {
      padding: 16,
      alignItems: 'center',
    },
    footer: {
      flexDirection: 'row',
      gap: 12,
      padding: 16,
      paddingTop: 12,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.outline + '20',
    },
  });

  // ============= UTILITY FUNCTIONS =============
  const calculateDifference = (): DifferenceData => {
    const target = parseFloat(targetBalanceValue || '0');
    const difference = target - currentBalance;
    return {
      difference,
      absoluteDifference: Math.abs(difference),
      type: difference > 0 ? 'income' : difference < 0 ? 'expense' : 'none',
      hasChange: Math.abs(difference) > 0.01 // Allow for floating point precision
    };
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const validateTargetBalance = (value: string) => {
    if (!value?.trim()) {
      return 'El balance objetivo es requerido';
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return 'Ingresa un balance válido';
    }
    
    if (numValue < VALIDATION_RULES.MIN_BALANCE || numValue > VALIDATION_RULES.MAX_BALANCE) {
      return 'El balance está fuera del rango permitido';
    }
    
    return true;
  };

  const cleanBalanceInput = (text: string): string => {
    return text.replace(/[^0-9.-]/g, '').replace(/(?!^)-/g, '');
  };

  const handleQuickAdjustment = (adjustment: number) => {
    const newBalance = currentBalance + adjustment;
    setValue('targetBalance', newBalance.toFixed(2), { shouldValidate: true });
  };

  const handleDescriptionSuggestion = (suggestion: string) => {
    setValue('description', suggestion);
  };

  const resetToCurrentBalance = () => {
    setValue('targetBalance', currentBalance.toFixed(2), { shouldValidate: true });
  };

  // ============= EVENT HANDLERS =============
  const onSubmit = async (data: RegularizeFormData) => {
    try {
      const targetBalance = parseFloat(data.targetBalance);
      
      if (isNaN(targetBalance)) {
        showSnackbar('Por favor ingresa un balance válido');
        return;
      }

      const diffData = calculateDifference();
      if (!diffData.hasChange) {
        showSnackbar('No hay diferencia significativa en el balance');
        return;
      }

      await onRegularize(targetBalance, data.description || undefined);
      
      showSnackbar('Balance regularizado correctamente');
      
      setTimeout(() => {
        reset();
        onDismiss();
      }, 100);
      
    } catch (error: any) {
      console.error('Error al regularizar balance:', error);
      showSnackbar(error.message || 'Error al regularizar el balance');
    }
  };

  const handleDismiss = () => {
    if (!loading) {
      reset();
      onDismiss();
    }
  };

  const diffData = calculateDifference();

  // ============= RENDER =============
  return (
    <>
      <SmoothPopupFullScreen
        visible={visible}
        onDismiss={handleDismiss}
        backgroundColor={theme.colors.surface}
        title="REGULARIZAR BALANCE"
      >
        <View style={styles.container}>
          <ScrollView 
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Balance actual */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Balance actual
              </Text>
              <SimpleCard shadowIntensity="medium">
                <View style={styles.balanceDisplay}>
                  <Text 
                    variant="bodyLarge" 
                    style={{ 
                      color: theme.colors.onSurfaceVariant,
                      marginBottom: 8,
                    }}
                  >
                    Tu saldo registrado
                  </Text>
                  <Text style={styles.currentBalance}>
                    S/ {currentBalance.toFixed(2)}
                  </Text>
                </View>
              </SimpleCard>
            </View>

            {/* Balance objetivo */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Balance objetivo
              </Text>
              <Controller
                control={control}
                name="targetBalance"
                rules={{ validate: validateTargetBalance }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Nuevo balance (S/)"
                      value={value}
                      onChangeText={(text) => onChange(cleanBalanceInput(text))}
                      onBlur={onBlur}
                      mode="outlined"
                      keyboardType="numeric"
                      left={<TextInput.Icon icon="target" />}
                      right={
                        <TextInput.Icon 
                          icon="refresh" 
                          onPress={resetToCurrentBalance}
                        />
                      }
                      error={!!errors.targetBalance}
                      placeholder="0.00"
                      disabled={loading}
                    />
                    <HelperText type="error" visible={!!errors.targetBalance}>
                      {errors.targetBalance?.message}
                    </HelperText>
                  </>
                )}
              />

              {/* Ajustes rápidos */}
              <View>
                <Text
                  variant="bodyMedium"
                  style={{
                    color: theme.colors.onSurfaceVariant,
                    marginBottom: 8,
                    marginTop: 8,
                  }}
                >
                  Ajustes rápidos
                </Text>
                <View style={styles.adjustmentContainer}>
                  {QUICK_ADJUSTMENTS.map((adjustment) => (
                    <Chip
                      key={adjustment}
                      mode="outlined"
                      onPress={() => handleQuickAdjustment(adjustment)}
                      disabled={loading}
                      compact
                      icon={adjustment > 0 ? "plus" : adjustment < 0 ? "minus" : "equal"}
                    >
                      {adjustment === 0 ? "Reset" : `${adjustment > 0 ? '+' : ''}S/ ${adjustment}`}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>

            {/* Vista previa del cambio */}
            {diffData.hasChange && (
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  Vista previa del ajuste
                </Text>
                <SimpleCard
                  shadowIntensity="strong"
                  style={{
                    backgroundColor: diffData.type === 'income' 
                      ? theme.colors.primaryContainer 
                      : theme.colors.errorContainer,
                  }}
                >
                  <View style={styles.differenceCard}>
                    <Text 
                      variant="bodyLarge" 
                      style={{ 
                        color: diffData.type === 'income' 
                          ? theme.colors.onPrimaryContainer 
                          : theme.colors.onErrorContainer,
                        marginBottom: 8,
                        fontWeight: '600'
                      }}
                    >
                      {diffData.type === 'income' ? 'Se registrará un ingreso de:' : 'Se registrará un gasto de:'}
                    </Text>
                    <Text style={[
                      styles.differenceAmount,
                      { 
                        color: diffData.type === 'income' 
                          ? theme.colors.onPrimaryContainer 
                          : theme.colors.onErrorContainer,
                      }
                    ]}>
                      {diffData.type === 'income' ? '+' : '-'}S/ {diffData.absoluteDifference.toFixed(2)}
                    </Text>
                    
                    <Divider style={{ 
                      width: '100%', 
                      marginVertical: 12,
                      backgroundColor: diffData.type === 'income' 
                        ? theme.colors.onPrimaryContainer 
                        : theme.colors.onErrorContainer,
                      opacity: 0.3,
                    }} />
                    
                    <Text variant="bodyMedium" style={{ 
                      color: diffData.type === 'income' 
                        ? theme.colors.onPrimaryContainer 
                        : theme.colors.onErrorContainer,
                      textAlign: 'center',
                    }}>
                      Nuevo balance: S/ {parseFloat(targetBalanceValue || '0').toFixed(2)}
                    </Text>
                  </View>
                </SimpleCard>
              </View>
            )}

            {!diffData.hasChange && targetBalanceValue && (
              <SimpleCard
                shadowIntensity="light"
                style={{
                  backgroundColor: theme.colors.secondaryContainer,
                  marginBottom: 20,
                }}
              >
                <View style={styles.warningCard}>
                  <Text variant="bodyLarge" style={{ 
                    color: theme.colors.onSecondaryContainer,
                    textAlign: 'center',
                    fontWeight: '500'
                  }}>
                    No hay cambios en el balance
                  </Text>
                  <Text variant="bodySmall" style={{ 
                    color: theme.colors.onSecondaryContainer,
                    textAlign: 'center',
                    marginTop: 4,
                    opacity: 0.8,
                  }}>
                    El balance objetivo es igual al actual
                  </Text>
                </View>
              </SimpleCard>
            )}

            <Divider style={{ marginVertical: 8 }} />

            {/* Descripción */}
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Motivo del ajuste
              </Text>
              <Controller
                control={control}
                name="description"
                rules={{
                  maxLength: {
                    value: VALIDATION_RULES.MAX_DESCRIPTION,
                    message: `La descripción no puede exceder ${VALIDATION_RULES.MAX_DESCRIPTION} caracteres`
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Descripción (opcional)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      left={<TextInput.Icon icon="text" />}
                      right={
                        value ? (
                          <TextInput.Icon 
                            icon="close" 
                            onPress={() => onChange("")}
                          />
                        ) : undefined
                      }
                      placeholder="Ej: Ajuste por efectivo en billetera"
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

              {/* Sugerencias */}
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
                  {DESCRIPTION_SUGGESTIONS.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      mode="outlined"
                      onPress={() => handleDescriptionSuggestion(suggestion)}
                      disabled={loading}
                      compact
                    >
                      {suggestion}
                    </Chip>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
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
              disabled={loading || !diffData.hasChange || !isValid}
              style={{ flex: 1 }}
              buttonColor={diffData.type === 'income' ? theme.colors.primary : theme.colors.error}
              icon={diffData.type === 'income' ? "plus" : "minus"}
            >
              {loading ? 'Regularizando...' : 'Regularizar'}
            </Button>
          </View>
        </View>
      </SmoothPopupFullScreen>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
        style={{
          backgroundColor: diffData.type === 'income' 
            ? theme.colors.primaryContainer 
            : theme.colors.errorContainer,
        }}
      >
        <Text style={{
          color: diffData.type === 'income' 
            ? theme.colors.onPrimaryContainer 
            : theme.colors.onErrorContainer,
        }}>
          {snackbarMessage}
        </Text>
      </Snackbar>
    </>
  );
};