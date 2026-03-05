import React, { useCallback, useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';
import { View } from 'react-native';

type MaskPreset = 'card' | 'account' | 'phone' | 'custom';

interface MaskConfig {
  mask: string;       // e.g. '#### #### #### ####'
  maskChar: string;   // character representing user input slot
  displayChar?: string; // character shown for hidden digits (e.g. '•')
}

const PRESET_MASKS: Record<Exclude<MaskPreset, 'custom'>, MaskConfig> = {
  card: { mask: '#### #### #### ####', maskChar: '#', displayChar: '•' },
  account: { mask: '###-#######-##', maskChar: '#' },
  phone: { mask: '+## ### ### ###', maskChar: '#' },
};

interface MaskedInputProps {
  label: string;
  value: string;
  onChangeText: (raw: string, formatted: string) => void;
  preset?: MaskPreset;
  mask?: string;
  maskChar?: string;
  hideValue?: boolean;
  visibleDigits?: number;
  error?: boolean;
  errorMessage?: string;
  icon?: string;
  mode?: 'outlined' | 'flat';
  editable?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const applyMask = (raw: string, mask: string, maskChar: string): string => {
  let result = '';
  let rawIndex = 0;
  for (let i = 0; i < mask.length && rawIndex < raw.length; i++) {
    if (mask[i] === maskChar) {
      result += raw[rawIndex];
      rawIndex++;
    } else {
      result += mask[i];
    }
  }
  return result;
};

const stripMask = (formatted: string, mask: string, maskChar: string): string => {
  let raw = '';
  for (let i = 0; i < formatted.length; i++) {
    if (i < mask.length && mask[i] === maskChar) {
      raw += formatted[i];
    } else if (i >= mask.length) {
      raw += formatted[i];
    }
  }
  return raw;
};

const hideDigits = (formatted: string, mask: string, maskChar: string, displayChar: string, visibleDigits: number): string => {
  const positions: number[] = [];
  for (let i = 0; i < formatted.length; i++) {
    if (i < mask.length && mask[i] === maskChar) {
      positions.push(i);
    }
  }
  const startVisible = Math.max(0, positions.length - visibleDigits);
  let result = '';
  let digitIndex = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (i < mask.length && mask[i] === maskChar) {
      result += digitIndex < startVisible ? displayChar : formatted[i];
      digitIndex++;
    } else {
      result += formatted[i];
    }
  }
  return result;
};

export const MaskedInput: React.FC<MaskedInputProps> = React.memo(({
  label,
  value,
  onChangeText,
  preset = 'custom',
  mask: customMask,
  maskChar: customMaskChar,
  hideValue = false,
  visibleDigits = 4,
  error = false,
  errorMessage,
  icon,
  mode = 'outlined',
  editable = true,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const config = useMemo((): MaskConfig => {
    if (preset !== 'custom' && PRESET_MASKS[preset]) {
      return PRESET_MASKS[preset];
    }
    return {
      mask: customMask || '####',
      maskChar: customMaskChar || '#',
    };
  }, [preset, customMask, customMaskChar]);

  const maxRawLength = useMemo(() => {
    let count = 0;
    for (const ch of config.mask) {
      if (ch === config.maskChar) count++;
    }
    return count;
  }, [config.mask, config.maskChar]);

  const formatted = useMemo(() => applyMask(value, config.mask, config.maskChar), [value, config.mask, config.maskChar]);

  const displayValue = useMemo(() => {
    if (!hideValue || !config.displayChar) return formatted;
    return hideDigits(formatted, config.mask, config.maskChar, config.displayChar, visibleDigits);
  }, [hideValue, formatted, config.mask, config.maskChar, config.displayChar, visibleDigits]);

  const handleChangeText = useCallback((text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    const trimmed = digitsOnly.slice(0, maxRawLength);
    const newFormatted = applyMask(trimmed, config.mask, config.maskChar);
    onChangeText(trimmed, newFormatted);
  }, [maxRawLength, config.mask, config.maskChar, onChangeText]);

  const hasError = error && !!errorMessage;
  const isEditable = editable && !disabled;

  const leftIcon = icon ? <TextInput.Icon icon={icon} /> : undefined;

  const containerStyle = useMemo(() => ({
    marginBottom: 2 as number,
  }), []);

  return (
    <View style={[containerStyle, style]}>
      <TextInput
        label={label}
        value={hideValue ? displayValue : formatted}
        onChangeText={handleChangeText}
        mode={mode}
        keyboardType="numeric"
        error={hasError}
        editable={isEditable}
        left={leftIcon}
        testID={testID}
        accessibilityLabel={accessibilityLabel || label}
      />
      <HelperText type="error" visible={hasError}>
        {errorMessage}
      </HelperText>
    </View>
  );
});
MaskedInput.displayName = 'MaskedInput';
