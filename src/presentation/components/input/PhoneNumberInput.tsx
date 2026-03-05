import React, { useCallback, useMemo, useState } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { TextInput, HelperText, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CountryCode {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

const DEFAULT_COUNTRIES: CountryCode[] = [
  { code: 'PE', dialCode: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: 'US', dialCode: '+1', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: 'MX', dialCode: '+52', flag: '🇲🇽', name: 'México' },
  { code: 'CO', dialCode: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: 'AR', dialCode: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: 'CL', dialCode: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: 'EC', dialCode: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: 'BR', dialCode: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: 'ES', dialCode: '+34', flag: '🇪🇸', name: 'España' },
];

interface PhoneNumberInputProps {
  label?: string;
  value: string;
  onChangeText: (phone: string, fullNumber: string) => void;
  countryCode?: string;
  onCountryChange?: (country: CountryCode) => void;
  countries?: CountryCode[];
  error?: boolean;
  errorMessage?: string;
  mode?: 'outlined' | 'flat';
  editable?: boolean;
  disabled?: boolean;
  maxLength?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const formatPhone = (raw: string): string => {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
};

export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = React.memo(({
  label = 'Teléfono',
  value,
  onChangeText,
  countryCode = 'PE',
  onCountryChange,
  countries = DEFAULT_COUNTRIES,
  error = false,
  errorMessage,
  mode = 'outlined',
  editable = true,
  disabled = false,
  maxLength = 12,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const [showCountries, setShowCountries] = useState(false);

  const selectedCountry = useMemo(() =>
    countries.find(c => c.code === countryCode) || countries[0],
    [countries, countryCode]
  );

  const handleChangeText = useCallback((text: string) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, maxLength);
    const full = `${selectedCountry.dialCode}${digits}`;
    onChangeText(digits, full);
  }, [maxLength, selectedCountry.dialCode, onChangeText]);

  const handleCountrySelect = useCallback((country: CountryCode) => {
    onCountryChange?.(country);
    setShowCountries(false);
  }, [onCountryChange]);

  const toggleCountries = useCallback(() => {
    if (!disabled && editable) {
      setShowCountries(prev => !prev);
    }
  }, [disabled, editable]);

  const hasError = error && !!errorMessage;
  const isEditable = editable && !disabled;
  const formatted = formatPhone(value);

  const prefixStyle = useMemo(() => ({
    color: theme.colors.onSurface,
    backgroundColor: theme.colors.surfaceVariant,
    borderColor: theme.colors.outlineVariant,
  }), [theme.colors.onSurface, theme.colors.surfaceVariant, theme.colors.outlineVariant]);

  const countryItemSelectedStyle = useMemo(() => ({
    backgroundColor: theme.colors.primaryContainer,
  }), [theme.colors.primaryContainer]);

  const dropdownStyle = useMemo(() => ({
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.outlineVariant,
  }), [theme.colors.surface, theme.colors.outlineVariant]);

  const dialCodeStyle = useMemo(() => ({
    color: theme.colors.onSurface,
  }), [theme.colors.onSurface]);

  const countryDialStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  return (
    <View style={[styles.wrapper, style]} testID={testID} accessibilityLabel={accessibilityLabel || label}>
      <View style={styles.row}>
        <Pressable
          onPress={toggleCountries}
          style={[styles.prefix, prefixStyle]}
          accessibilityLabel={`País: ${selectedCountry.name}`}
        >
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text variant="bodyMedium" style={dialCodeStyle}>
            {selectedCountry.dialCode}
          </Text>
          <MaterialCommunityIcons
            name={(showCountries ? 'chevron-up' : 'chevron-down') as keyof typeof MaterialCommunityIcons.glyphMap}
            size={16}
            color={theme.colors.onSurfaceVariant}
          />
        </Pressable>
        <View style={styles.inputContainer}>
          <TextInput
            label={label}
            value={formatted}
            onChangeText={handleChangeText}
            mode={mode}
            keyboardType="phone-pad"
            error={hasError}
            editable={isEditable}
            testID={testID ? `${testID}-input` : undefined}
          />
        </View>
      </View>

      {showCountries && (
        <View style={[styles.dropdown, dropdownStyle]}>
          {countries.map((country) => (
            <Pressable
              key={country.code}
              onPress={() => handleCountrySelect(country)}
              style={[
                styles.countryItem,
                country.code === countryCode && countryItemSelectedStyle,
              ]}
            >
              <Text style={styles.flag}>{country.flag}</Text>
              <Text variant="bodyMedium" style={styles.countryName}>{country.name}</Text>
              <Text variant="bodySmall" style={countryDialStyle}>
                {country.dialCode}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <HelperText type="error" visible={hasError}>
        {errorMessage}
      </HelperText>
    </View>
  );
});
PhoneNumberInput.displayName = 'PhoneNumberInput';

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    borderWidth: 1,
    height: 56,
  },
  flag: {
    fontSize: 18,
  },
  inputContainer: {
    flex: 1,
  },
  dropdown: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  countryName: {
    flex: 1,
  },
});
