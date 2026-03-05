import React, { useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import {
  Text,
  TextInput,
  HelperText,
  RadioButton,
  Surface,
  useTheme,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GenderType } from "@/domain/types/GenderType";

const GENDERS: GenderType[] = ["male", "female"];

interface PersonalInfoSectionProps {
  values: {
    fullName: string;
    birthDate: Date;
    gender: GenderType;
  };
  errors: Record<string, string | undefined>;
  touched: Record<string, boolean | undefined>;
  loading: boolean;
  showDatePicker: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordValue: string;
  confirmPasswordValue: string;
  handleChange: (field: string) => (text: string) => void;
  handleBlur: (field: string) => () => void;
  setFieldValue: (field: string, value: unknown) => void;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
  onOpenDatePicker: () => void;
  onCloseDatePicker: () => void;
  formatDate: (date: Date) => string;
  styles: Record<string, any>;
}

export const PersonalInfoSection = React.memo(({
  values,
  errors,
  touched,
  loading,
  showDatePicker,
  showPassword,
  showConfirmPassword,
  passwordValue,
  confirmPasswordValue,
  handleChange,
  handleBlur,
  setFieldValue,
  onTogglePassword,
  onToggleConfirmPassword,
  onOpenDatePicker,
  onCloseDatePicker,
  formatDate,
  styles,
}: PersonalInfoSectionProps) => {
  const theme = useTheme();

  const handleDateChange = useCallback((_event: unknown, selectedDate?: Date) => {
    onCloseDatePicker();
    if (selectedDate) setFieldValue("birthDate", selectedDate);
  }, [onCloseDatePicker, setFieldValue]);

  return (
    <>
      {/* Nombre */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Nombre Completo"
          value={values.fullName}
          onChangeText={handleChange("fullName")}
          onBlur={handleBlur("fullName")}
          mode="outlined"
          autoCapitalize="words"
          error={!!(touched.fullName && errors.fullName)}
          left={<TextInput.Icon icon="account" />}
          editable={!loading}
        />
        <HelperText type="error" visible={!!(touched.fullName && errors.fullName)}>
          {errors.fullName}
        </HelperText>
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Correo Electrónico"
          value={(values as any).email}
          onChangeText={handleChange("email")}
          onBlur={handleBlur("email")}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={!!(touched.email && errors.email)}
          left={<TextInput.Icon icon="email" />}
          editable={!loading}
        />
        <HelperText type="error" visible={!!(touched.email && errors.email)}>
          {errors.email}
        </HelperText>
      </View>

      {/* Contraseña */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Contraseña"
          value={passwordValue}
          onChangeText={handleChange("password")}
          onBlur={handleBlur("password")}
          mode="outlined"
          secureTextEntry={!showPassword}
          error={!!(touched.password && errors.password)}
          left={<TextInput.Icon icon="lock" />}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={onTogglePassword}
            />
          }
          editable={!loading}
        />
        <HelperText type="error" visible={!!(touched.password && errors.password)}>
          {errors.password}
        </HelperText>
      </View>

      {/* Confirmar Contraseña */}
      <View style={styles.inputContainer}>
        <TextInput
          label="Confirmar Contraseña"
          value={confirmPasswordValue}
          onChangeText={handleChange("confirmPassword")}
          onBlur={handleBlur("confirmPassword")}
          mode="outlined"
          secureTextEntry={!showConfirmPassword}
          error={!!(touched.confirmPassword && errors.confirmPassword)}
          left={<TextInput.Icon icon="lock-check" />}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? "eye-off" : "eye"}
              onPress={onToggleConfirmPassword}
            />
          }
          editable={!loading}
        />
        <HelperText type="error" visible={!!(touched.confirmPassword && errors.confirmPassword)}>
          {errors.confirmPassword}
        </HelperText>
      </View>

      {/* Fecha Nacimiento */}
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={onOpenDatePicker} activeOpacity={0.8} disabled={loading}>
          <TextInput
            label="Fecha de Nacimiento"
            value={formatDate(values.birthDate)}
            mode="outlined"
            editable={false}
            pointerEvents="none"
            left={<TextInput.Icon icon="calendar" />}
            right={<TextInput.Icon icon="calendar-edit" />}
            error={!!(touched.birthDate && errors.birthDate)}
          />
        </TouchableOpacity>
        <HelperText type="error" visible={!!(touched.birthDate && errors.birthDate)}>
          {errors.birthDate as string}
        </HelperText>
      </View>

      {/* Género */}
      <View style={styles.inputContainer}>
        <Text variant="bodyLarge" style={styles.genderText}>
          Género
        </Text>
        <Surface style={styles.genderSurface} elevation={1}>
          <RadioButton.Group
            onValueChange={(value) => setFieldValue("gender", value)}
            value={values.gender}
          >
            <View style={styles.genderRow}>
              {GENDERS.map((g) => (
                <View key={g} style={styles.genderItem}>
                  <RadioButton value={g} disabled={loading} />
                  <Text style={{ color: theme.colors.onBackground }}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </View>
              ))}
            </View>
          </RadioButton.Group>
        </Surface>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={values.birthDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}
    </>
  );
});
