import { useMemo } from 'react';
import { useTheme } from 'react-native-paper';

/**
 * Hook compartido para override de colores de label en TextInput de react-native-paper.
 * Elimina duplicación del patrón labelColors en FormInput, TextArea, CurrencyInput, etc.
 */
export const useInputTheme = () => {
  const theme = useTheme();

  return useMemo(() => ({
    colors: {
      onSurfaceVariant: theme.colors.onBackground,
      primary: theme.colors.primary,
    },
  }), [theme.colors.onBackground, theme.colors.primary]);
};
