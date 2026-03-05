import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/presentation/theme/materialTheme';
import { withAlpha } from '@/presentation/theme/colorUtils';

type CategorySize = 'sm' | 'md' | 'lg';

const SIZE_CONFIG: Record<CategorySize, { container: number; icon: number }> = {
  sm: { container: 32, icon: 16 },
  md: { container: 40, icon: 20 },
  lg: { container: 52, icon: 26 },
};

type ThemeColorKey = 'error' | 'primary' | 'tertiary' | 'secondary' | 'info' | 'warning' | 'success' | 'neutral' | 'onSurfaceVariant';

interface CategoryConfig {
  icon: string;
  colorKey: ThemeColorKey;
  bgKey?: string;
}

const CATEGORY_MAP: Record<string, CategoryConfig> = {
  food:           { icon: 'food',              colorKey: 'error' },
  transport:      { icon: 'car',               colorKey: 'info' },
  health:         { icon: 'hospital-box',      colorKey: 'error' },
  entertainment:  { icon: 'gamepad-variant',   colorKey: 'tertiary' },
  shopping:       { icon: 'cart',              colorKey: 'error' },
  housing:        { icon: 'home',              colorKey: 'success' },
  education:      { icon: 'school',            colorKey: 'primary' },
  salary:         { icon: 'cash',              colorKey: 'success' },
  investment:     { icon: 'trending-up',       colorKey: 'tertiary' },
  transfer:       { icon: 'bank-transfer',     colorKey: 'info' },
  bills:          { icon: 'file-document',     colorKey: 'warning' },
  subscription:   { icon: 'credit-card-clock', colorKey: 'tertiary' },
  savings:        { icon: 'piggy-bank',        colorKey: 'success' },
  gift:           { icon: 'gift',              colorKey: 'error' },
  other:          { icon: 'dots-horizontal',   colorKey: 'onSurfaceVariant' },
};

interface CategoryIconProps {
  category: string;
  size?: CategorySize;
  icon?: string;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = React.memo(({
  category,
  size = 'md',
  icon: iconOverride,
  color: colorOverride,
  backgroundColor: bgOverride,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];
  const config = SIZE_CONFIG[size];
  const catConfig = CATEGORY_MAP[category] || CATEGORY_MAP.other;

  const resolvedIcon = iconOverride || catConfig.icon;
  const resolvedColor = colorOverride || colors[catConfig.colorKey];
  const resolvedBg = bgOverride || withAlpha(resolvedColor, theme.dark ? 0.15 : 0.09);

  const containerStyle = useMemo(() => ({
    width: config.container,
    height: config.container,
    borderRadius: config.container / 2,
    backgroundColor: resolvedBg,
  }), [config.container, resolvedBg]);

  return (
    <View
      style={[styles.container, containerStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || category}
    >
      <MaterialCommunityIcons
        name={resolvedIcon as keyof typeof MaterialCommunityIcons.glyphMap}
        size={config.icon}
        color={resolvedColor}
      />
    </View>
  );
});
CategoryIcon.displayName = 'CategoryIcon';

export { CATEGORY_MAP };

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
