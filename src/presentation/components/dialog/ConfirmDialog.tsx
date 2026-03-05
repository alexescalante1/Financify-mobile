import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedDialog } from '@/presentation/components/dialog/AnimatedDialog';
import { FinancifyButton, ButtonVariant } from '@/presentation/components/button/FinancifyButton';

interface ConfirmDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmVariant?: ButtonVariant;
  cancelVariant?: ButtonVariant;
  loading?: boolean;
  icon?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = React.memo(({
  visible,
  onDismiss,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  cancelVariant = 'ghost',
  loading = false,
  icon,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const handleCancel = useCallback(() => {
    (onCancel || onDismiss)();
  }, [onCancel, onDismiss]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const messageStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center' as const,
    marginTop: 8,
  }), [theme.colors.onSurfaceVariant]);

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

        <Text variant="titleLarge" style={styles.title}>
          {title}
        </Text>

        <Text variant="bodyMedium" style={messageStyle}>
          {message}
        </Text>

        <View style={styles.buttonRow}>
          <FinancifyButton
            title={cancelLabel}
            variant={cancelVariant}
            size="md"
            onPress={handleCancel}
            disabled={loading}
            style={styles.button}
          />
          <FinancifyButton
            title={confirmLabel}
            variant={confirmVariant}
            size="md"
            onPress={handleConfirm}
            loading={loading}
            style={styles.button}
          />
        </View>
      </View>
    </AnimatedDialog>
  );
});
ConfirmDialog.displayName = 'ConfirmDialog';

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
