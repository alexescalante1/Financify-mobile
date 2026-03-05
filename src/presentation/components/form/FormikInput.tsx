import React, { useMemo, useCallback } from 'react';
import { ViewStyle, KeyboardTypeOptions } from 'react-native';
import { useFormikContext } from 'formik';
import { FormInput } from '@/presentation/components/form/FormInput';

interface FormikInputProps {
  name: string;
  label: string;
  icon?: string;
  mode?: 'outlined' | 'flat';
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const FormikInput: React.FC<FormikInputProps> = React.memo(({
  name,
  label,
  ...rest
}) => {
  const { values, errors, touched, handleChange, setFieldTouched } =
    useFormikContext<Record<string, string>>();

  const value = values[name] ?? '';
  const fieldError = touched[name] ? (errors[name] as string | undefined) : undefined;

  const onChangeText = useMemo(() => handleChange(name), [handleChange, name]);

  const onBlur = useCallback(
    () => { setFieldTouched(name, true); },
    [setFieldTouched, name]
  );

  return (
    <FormInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      error={!!fieldError}
      errorMessage={fieldError}
      {...rest}
    />
  );
});

FormikInput.displayName = 'FormikInput';
