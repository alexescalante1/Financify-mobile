import React, { useMemo } from 'react';
import {
  Button as PaperButton,
  useTheme,
  ActivityIndicator
} from 'react-native-paper';
import {
  StyleSheet,
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native';
import type { AppTheme } from '@/presentation/theme/materialTheme';
import { withAlpha } from '@/presentation/theme/colorUtils';

export type ButtonVariant =
  | 'primary' | 'secondary' | 'tertiary'
  | 'danger' | 'success' | 'warning'
  | 'outline' | 'ghost';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface FinancifyButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  compact?: boolean;
  uppercase?: boolean;
  fullWidth?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

const CONFIG = {
  sizes: {
    xs: { height: 28, px: 8, fontSize: 11, iconSize: 14 },
    sm: { height: 32, px: 12, fontSize: 13, iconSize: 16 },
    md: { height: 40, px: 16, fontSize: 14, iconSize: 18 },
    lg: { height: 48, px: 20, fontSize: 16, iconSize: 20 },
    xl: { height: 56, px: 24, fontSize: 18, iconSize: 22 },
  },
  radius: { xs: 8, sm: 8, md: 8, lg: 12, xl: 12 },
  shadow: {
    ios: { offset: { width: 0, height: 2 }, radius: 8 },
    android: { elevation: 3, elevationOutline: 1 },
  },
} as const;

export const FinancifyButton: React.FC<FinancifyButtonProps> = React.memo(({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  onPress,
  style,
  textStyle,
  compact = false,
  uppercase = false,
  fullWidth = false,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const computedStyles = useMemo(() => {
    const colors = theme.colors as AppTheme['colors'];
    const sizeConfig = CONFIG.sizes[size];
    const isOutline = variant === 'outline';
    const isGhost = variant === 'ghost';

    const colorMap: Record<ButtonVariant, string> = {
      primary: colors.primary,
      secondary: colors.secondary,
      tertiary: colors.tertiary,
      danger: colors.error,
      success: colors.success,
      warning: colors.warning,
      outline: colors.primary,
      ghost: colors.primary,
    };

    const textColorMap: Record<ButtonVariant, string> = {
      primary: colors.onPrimary,
      secondary: colors.onSecondary,
      tertiary: colors.onTertiary,
      danger: colors.onError,
      success: colors.onSuccess,
      warning: colors.onWarning,
      outline: colors.primary,
      ghost: colors.primary,
    };

    const bgColor = isOutline || isGhost ? 'transparent' : colorMap[variant];
    const textColor = isOutline || isGhost ? colorMap[variant] : textColorMap[variant];
    const shadowColor = colorMap[variant];

    const shadowStyle = (() => {
      if (isGhost || disabled) return {};

      const opacity = loading ? 0.07 : (isOutline ? 0.06 : 0.14);

      return Platform.select({
        ios: {
          shadowColor: shadowColor,
          shadowOffset: CONFIG.shadow.ios.offset,
          shadowOpacity: opacity,
          shadowRadius: CONFIG.shadow.ios.radius,
        },
        android: {
          elevation: isOutline ? CONFIG.shadow.android.elevationOutline : CONFIG.shadow.android.elevation,
        },
      }) || {};
    })();

    return {
      bg: bgColor,
      text: textColor,
      shadow: shadowStyle,
      ripple: withAlpha(shadowColor, isGhost ? 0.03 : isOutline ? 0.06 : 0.13),
      mode: (isOutline ? 'outlined' : isGhost ? 'text' : 'contained') as 'outlined' | 'text' | 'contained',
      size: sizeConfig,
      radius: CONFIG.radius[size],
      isOutline,
    };
  }, [theme, variant, size, loading, disabled]);

  const renderIcon = useMemo(() => loading ? () => (
    <ActivityIndicator
      size={computedStyles.size.iconSize}
      color={computedStyles.text}
    />
  ) : icon, [loading, icon, computedStyles.text, computedStyles.size.iconSize]);

  return (
    <PaperButton
      mode={computedStyles.mode}
      buttonColor={computedStyles.bg}
      textColor={computedStyles.text}
      rippleColor={computedStyles.ripple}
      icon={renderIcon}
      onPress={onPress}
      disabled={disabled || loading}
      compact={compact}
      uppercase={uppercase}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      contentStyle={[
        styles.content,
        {
          height: computedStyles.size.height,
          paddingHorizontal: computedStyles.size.px,
          minWidth: compact ? 'auto' : computedStyles.size.height * 2,
        },
        iconPosition === 'right' && styles.iconRight,
        fullWidth && styles.fullWidth,
      ]}
      labelStyle={[
        styles.label,
        {
          fontSize: computedStyles.size.fontSize,
          lineHeight: computedStyles.size.fontSize * 1.2,
        },
        textStyle,
      ]}
      style={[
        styles.button,
        {
          borderRadius: computedStyles.radius,
          minWidth: fullWidth ? '100%' : 'auto',
        },
        computedStyles.shadow,
        computedStyles.isOutline && {
          borderColor: computedStyles.text,
          borderWidth: 1,
        },
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {title}
    </PaperButton>
  );
});

FinancifyButton.displayName = 'FinancifyButton';

const styles = StyleSheet.create({
  button: {},
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRight: {
    flexDirection: 'row-reverse',
  },
  fullWidth: {
    flex: 1,
  },
  label: {
    fontWeight: '500',
    letterSpacing: 0.15,
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
});
