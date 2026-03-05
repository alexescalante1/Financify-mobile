import React, { useMemo } from 'react';
import { View, ViewStyle, TextStyle, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const FormSection: React.FC<FormSectionProps> = React.memo(({
  title,
  subtitle,
  children,
  style,
  titleStyle,
  subtitleStyle,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const subtitleColor = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  const wrapperStyle = useMemo(() => ({
    marginBottom: subtitle ? 8 : 12,
  }), [subtitle]);

  return (
    <View
      style={[wrapperStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
    >
      <Text
        variant="titleSmall"
        style={[sectionStyles.title, titleStyle]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="bodySmall"
          style={[sectionStyles.subtitle, subtitleColor, subtitleStyle]}
        >
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
});
FormSection.displayName = 'FormSection';

const sectionStyles = StyleSheet.create({
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginTop: 4,
    letterSpacing: 0.2,
  },
});
