import React, { useMemo, useCallback, useState } from 'react';
import { TextStyle, Pressable, View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/presentation/theme/materialTheme';

type AmountSize = 'sm' | 'md' | 'lg' | 'xl';

const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: 'S/',
  USD: '$',
  EUR: '€',
};

const SIZE_VARIANT_MAP: Record<AmountSize, 'bodySmall' | 'bodyLarge' | 'titleLarge' | 'headlineMedium'> = {
  sm: 'bodySmall',
  md: 'bodyLarge',
  lg: 'titleLarge',
  xl: 'headlineMedium',
};

const SIZE_ICON_MAP: Record<AmountSize, number> = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

interface AmountDisplayProps {
  amount: number;
  currency?: string;
  currencySymbol?: string;
  locale?: string;
  showSign?: boolean;
  colorize?: boolean;
  size?: AmountSize;
  hidden?: boolean;
  onToggleVisibility?: (visible: boolean) => void;
  style?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = React.memo(({
  amount,
  currency = 'PEN',
  currencySymbol,
  locale = 'es-PE',
  showSign = true,
  colorize = true,
  size = 'md',
  hidden = false,
  onToggleVisibility,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];
  const [isHidden, setIsHidden] = useState(hidden);

  const symbol = currencySymbol || CURRENCY_SYMBOLS[currency] || currency;
  const variant = SIZE_VARIANT_MAP[size];
  const iconSize = SIZE_ICON_MAP[size];

  const formattedText = useMemo(() => {
    const absFormatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(amount));

    const sign = amount > 0 && showSign ? '+' : amount < 0 ? '-' : '';
    return `${sign}${symbol} ${absFormatted}`;
  }, [amount, symbol, showSign, locale]);

  const textColor = useMemo(() => {
    if (!colorize) return theme.colors.onSurface;
    if (amount > 0) return colors.profit;
    if (amount < 0) return colors.loss;
    return colors.neutral;
  }, [amount, colorize, colors.profit, colors.loss, colors.neutral, theme.colors.onSurface]);

  const textStyle = useMemo(() => ({
    color: textColor,
    fontWeight: '600' as const,
  }), [textColor]);

  const handleToggle = useCallback(() => {
    const newState = !isHidden;
    setIsHidden(newState);
    onToggleVisibility?.(newState);
  }, [isHidden, onToggleVisibility]);

  const displayText = isHidden ? `${symbol} ••••••` : formattedText;

  if (onToggleVisibility !== undefined) {
    return (
      <Pressable
        onPress={handleToggle}
        style={styles.row}
        hitSlop={4}
        testID={testID}
        accessibilityLabel={accessibilityLabel || (isHidden ? 'Monto oculto' : formattedText)}
        accessibilityRole="button"
      >
        <Text
          variant={variant}
          style={[textStyle, style]}
        >
          {displayText}
        </Text>
        <MaterialCommunityIcons
          name={isHidden ? 'eye-off-outline' : 'eye-outline'}
          size={iconSize}
          color={theme.colors.onSurfaceVariant}
          style={styles.eyeIcon}
        />
      </Pressable>
    );
  }

  return (
    <Text
      variant={variant}
      style={[textStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || displayText}
    >
      {displayText}
    </Text>
  );
});
AmountDisplay.displayName = 'AmountDisplay';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    marginLeft: 8,
  },
});
