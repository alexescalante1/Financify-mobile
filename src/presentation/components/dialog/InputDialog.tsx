import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedDialog } from '@/presentation/components/dialog/AnimatedDialog';
import { FinancifyButton, ButtonVariant } from '@/presentation/components/button/FinancifyButton';

interface InputDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message?: string;
  label: string;
  initialValue?: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  onConfirm: (value: string) => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: ButtonVariant;
  loading?: boolean;
  icon?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export const InputDialog: React.FC<InputDialogProps> = React.memo(({
  visible,
  onDismiss,
  title,
  message,
  label,
  initialValue = '',
  placeholder,
  keyboardType,
  maxLength,
  onConfirm,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'primary',
  loading = false,
  icon,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const handleConfirm = useCallback(() => {
    onConfirm(value.trim());
  }, [onConfirm, value]);

  const messageStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center' as const,
    marginTop: 8,
  }), [theme.colors.onSurfaceVariant]);

  const isConfirmDisabled = value.trim().length === 0 || loading;

  return (
    <AnimatedDialog
      visible={visible}
      onDismiss={onDismiss}
      showCloseButton={false}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.content}>
        {icon ? (
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={40}
            color={theme.colors.primary}
            style={styles.icon}
          />
        ) : null}

        <Text variant="titleLarge" style={styles.title}>{title}</Text>

        {message ? (
          <Text variant="bodyMedium" style={messageStyle}>{message}</Text>
        ) : null}

        <TextInput
          mode="outlined"
          label={label}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          keyboardType={keyboardType}
          maxLength={maxLength}
          style={styles.input}
          outlineColor={theme.colors.outlineVariant}
          activeOutlineColor={theme.colors.primary}
        />

        <View style={styles.buttonRow}>
          <FinancifyButton
            title={cancelLabel}
            variant="ghost"
            size="md"
            onPress={onDismiss}
            disabled={loading}
            style={styles.button}
          />
          <FinancifyButton
            title={confirmLabel}
            variant={confirmVariant}
            size="md"
            onPress={handleConfirm}
            loading={loading}
            disabled={isConfirmDisabled}
            style={styles.button}
          />
        </View>
      </View>
    </AnimatedDialog>
  );
});
InputDialog.displayName = 'InputDialog';

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    width: '100%',
  },
  button: {
    flex: 1,
  },
});
