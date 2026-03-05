import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
import {
  CardVariant,
  CardBorderStyle,
  COLOR_PALETTE,
  BORDER_STYLES,
  BASE_CARD_STYLE,
} from './cardConstants';

interface SimpleCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
  borderStyle?: CardBorderStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const SimpleCard: React.FC<SimpleCardProps> = React.memo(({
  children,
  style,
  variant = 'default',
  borderStyle = 'elegant',
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const cardStyles = useMemo(() => {
    let backgroundColor: string;
    let borderColor: string;

    if (variant === 'default') {
      backgroundColor = theme.colors.surface;
      borderColor = theme.colors.outlineVariant;
    } else {
      const colors = COLOR_PALETTE[variant as keyof typeof COLOR_PALETTE];
      const themeColors = theme.dark ? colors.dark : colors.light;
      backgroundColor = themeColors.bg;
      borderColor = themeColors.border;
    }

    const borderConfig = BORDER_STYLES[borderStyle];
    const borderStyles = borderConfig.borderWidth === 0
      ? { borderWidth: 0 }
      : {
          borderWidth: borderConfig.borderWidth,
          borderColor: borderColor + (borderConfig.opacity || ''),
        };

    return {
      ...BASE_CARD_STYLE,
      padding: 12,
      backgroundColor,
      ...borderStyles,
    };
  }, [variant, borderStyle, theme.colors.surface, theme.colors.outlineVariant, theme.dark]);

  const finalStyle = useMemo(() => [cardStyles, style], [cardStyles, style]);

  return (
    <View
      style={finalStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
});
SimpleCard.displayName = 'SimpleCard';
