import React, { useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BASE_CARD_STYLE } from '@/presentation/components/card/cardConstants';
import type { AppTheme } from '@/presentation/theme/materialTheme';

type GradientPreset = 'primary' | 'success' | 'purple' | 'dark' | 'custom';

interface GradientCardProps {
  children: React.ReactNode;
  preset?: GradientPreset;
  customColors?: [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const GradientCard: React.FC<GradientCardProps> = React.memo(({
  children,
  preset = 'primary',
  customColors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];

  const gradientColors = useMemo((): [string, string, ...string[]] => {
    if (preset === 'custom' && customColors) return customColors;

    const presets: Record<Exclude<GradientPreset, 'custom'>, [string, string]> = {
      primary: [theme.colors.primary, theme.colors.primaryContainer],
      success: [colors.success, theme.colors.secondaryContainer],
      purple: [theme.colors.tertiary, theme.colors.tertiaryContainer],
      dark: theme.dark
        ? [theme.colors.background, theme.colors.surface]
        : [theme.colors.onBackground, theme.colors.onSurface],
    };

    return presets[preset as Exclude<GradientPreset, 'custom'>] || presets.primary;
  }, [preset, customColors, theme.colors.primary, theme.colors.primaryContainer,
      colors.success, theme.colors.secondaryContainer, theme.colors.tertiary,
      theme.colors.tertiaryContainer, theme.dark, theme.colors.background,
      theme.colors.surface, theme.colors.onBackground, theme.colors.onSurface]);

  const containerStyle = useMemo(() => ({
    ...BASE_CARD_STYLE,
    padding: 16,
    overflow: 'hidden' as const,
    ...style,
  }), [style]);

  return (
    <LinearGradient
      colors={gradientColors}
      start={start}
      end={end}
      style={containerStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </LinearGradient>
  );
});
GradientCard.displayName = 'GradientCard';
