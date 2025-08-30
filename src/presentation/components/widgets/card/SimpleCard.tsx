import React, { useMemo } from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type CardVariant = 
  | 'default'    // Usa el tema actual (blanco/oscuro)
  | 'white'      // Siempre blanco
  | 'dark'       // Siempre oscuro
  | 'green'      // Verde pastel
  | 'blue'       // Azul pastel
  | 'purple'     // Púrpura pastel
  | 'orange'     // Naranja pastel
  | 'pink'       // Rosa pastel
  | 'yellow'     // Amarillo pastel
  | 'red'        // Rojo pastel
  | 'teal';      // Teal pastel

interface PerfectCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
  borderStyle?: 'none' | 'subtle' | 'elegant' | 'bold';
}

// Colores predefinidos para evitar cálculos en cada render
const COLOR_PALETTE = {
  white: {
    light: { bg: '#FFFFFF', border: '#E5E7EB' }, // base neutra clara
    dark: { bg: '#F9FAFB', border: '#D1D5DB' }   // gris muy suave
  },
  dark: {
    light: { bg: '#111827', border: '#374151' }, // gris casi negro
    dark: { bg: '#0F172A', border: '#475569' }   // azul oscuro elegante
  },
  green: {
    light: { bg: '#DCFCE7', border: '#22C55E' }, // verde pastel
    dark: { bg: '#14532D', border: '#4ADE80' }   // verde vibrante
  },
  blue: {
    light: { bg: '#E0F2FE', border: '#0EA5E9' }, // celeste pastel
    dark: { bg: '#1E3A8A', border: '#38BDF8' }   // azul con contraste
  },
  purple: {
    light: { bg: '#F3E8FF', border: '#9333EA' }, // lavanda suave
    dark: { bg: '#581C87', border: '#C084FC' }   // morado brillante
  },
  orange: {
    light: { bg: '#FFEDD5', border: '#EA580C' }, // naranja pastel
    dark: { bg: '#7C2D12', border: '#FB923C' }   // cálido y vibrante
  },
  pink: {
    light: { bg: '#FCE7F3', border: '#DB2777' }, // rosado suave
    dark: { bg: '#831843', border: '#F472B6' }   // fucsia vibrante
  },
  yellow: {
    light: { bg: '#FEF9C3', border: '#CA8A04' }, // amarillo pastel
    dark: { bg: '#713F12', border: '#FACC15' }   // dorado intenso
  },
  red: {
    light: { bg: '#FEE2E2', border: '#DC2626' }, // rojo pastel
    dark: { bg: '#7F1D1D', border: '#F87171' }   // rojo elegante
  },
  teal: {
    light: { bg: '#CCFBF1', border: '#0D9488' }, // turquesa claro
    dark: { bg: '#134E4A', border: '#2DD4BF' }   // verde azulado profundo
  }
} as const;


// Estilos de borde predefinidos
const BORDER_STYLES = {
  none: { borderWidth: 0 },
  subtle: { borderWidth: 1, opacity: '40' },
  elegant: { borderWidth: 1.5, opacity: '60' },
  bold: { borderWidth: 1.9, opacity: '80' }
} as const;

// Estilos base que no cambian
const BASE_STYLE = {
  borderRadius: 8,
  margin: 6,
  padding: 12,
  shadowOpacity: 0,
  elevation: 0,
} as const;

export const SimpleCard: React.FC<PerfectCardProps> = React.memo(({
  children,
  style,
  variant = 'default',
  borderStyle = 'elegant',
}) => {
  const theme = useTheme();

  // Memoizar estilos calculados para evitar recalcular en cada render
  const cardStyles = useMemo(() => {
    let backgroundColor: string;
    let borderColor: string;

    if (variant === 'default') {
      backgroundColor = theme.colors.surface;
      borderColor = theme.dark ? '#374151' : '#E5E7EB';
    } else {
      const colors = COLOR_PALETTE[variant as keyof typeof COLOR_PALETTE];
      const themeColors = theme.dark ? colors.dark : colors.light;
      backgroundColor = themeColors.bg;
      borderColor = themeColors.border;
    }

    // Obtener estilos de borde
    const borderConfig = BORDER_STYLES[borderStyle];
    const borderStyles = borderConfig.borderWidth === 0 
      ? { borderWidth: 0 }
      : {
          borderWidth: borderConfig.borderWidth,
          borderColor: borderColor + (borderConfig.opacity || ''),
        };

    return {
      ...BASE_STYLE,
      backgroundColor,
      ...borderStyles,
    };
  }, [variant, borderStyle, theme.colors.surface, theme.dark]);

  // Combinar estilos una sola vez
  const finalStyle = useMemo(() => [cardStyles, style], [cardStyles, style]);

  return (
    <View style={finalStyle}>
      {children}
    </View>
  );
});