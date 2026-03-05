import React, { useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import { Text, HelperText, useTheme } from "react-native-paper";
import { CurrencyType } from "@/domain/types/CurrencyType";

const CURRENCIES = [
  { code: "PEN" as CurrencyType, name: "Soles Peruanos", symbol: "S/", flag: "🇵🇪" },
  { code: "USD" as CurrencyType, name: "Dólares Americanos", symbol: "$", flag: "🇺🇸" },
];

interface CurrencySectionProps {
  selectedCurrency: CurrencyType;
  onSelect: (currency: CurrencyType) => void;
  styles: Record<string, any>;
}

const CurrencyButton = React.memo(({
  currency,
  isSelected,
  onPress,
}: {
  currency: typeof CURRENCIES[0];
  isSelected: boolean;
  onPress: () => void;
}) => {
  const theme = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: isSelected ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
        borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
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
          color: isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant,
          textAlign: "center",
          fontWeight: "500",
        }}
      >
        {currency.code}
      </Text>
    </TouchableOpacity>
  );
});

export const CurrencySection = React.memo(({
  selectedCurrency,
  onSelect,
  styles,
}: CurrencySectionProps) => {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text variant="bodyLarge" style={styles.currencyText}>
        Moneda Principal
      </Text>

      <View style={styles.currencyRow}>
        {CURRENCIES.map((currency) => (
          <CurrencyButton
            key={currency.code}
            currency={currency}
            isSelected={selectedCurrency === currency.code}
            onPress={() => onSelect(currency.code)}
          />
        ))}
      </View>

      <HelperText type="info" visible={true}>
        Esta será tu moneda por defecto para ingresos y gastos
      </HelperText>
    </View>
  );
});
