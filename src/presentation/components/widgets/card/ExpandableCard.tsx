import React, { useState, useMemo } from 'react';
import { View, ViewStyle, Pressable, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme, Text, IconButton } from 'react-native-paper';

// Habilitar animaciones en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
  borderStyle?: 'none' | 'subtle' | 'elegant' | 'bold';
  initialExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  headerStyle?: ViewStyle;
  titleStyle?: any;
  iconPosition?: 'left' | 'right';
  expandIcon?: string;
  collapseIcon?: string;
}

// Reutilizar los mismos colores del SimpleCard
const COLOR_PALETTE = {
  white: {
    light: { bg: '#FFFFFF', border: '#E5E7EB' },
    dark: { bg: '#F9FAFB', border: '#D1D5DB' }
  },
  dark: {
    light: { bg: '#111827', border: '#374151' },
    dark: { bg: '#0F172A', border: '#475569' }
  },
  green: {
    light: { bg: '#DCFCE7', border: '#22C55E' },
    dark: { bg: '#14532D', border: '#4ADE80' }
  },
  blue: {
    light: { bg: '#E0F2FE', border: '#0EA5E9' },
    dark: { bg: '#1E3A8A', border: '#38BDF8' }
  },
  purple: {
    light: { bg: '#F3E8FF', border: '#9333EA' },
    dark: { bg: '#581C87', border: '#C084FC' }
  },
  orange: {
    light: { bg: '#FFEDD5', border: '#EA580C' },
    dark: { bg: '#7C2D12', border: '#FB923C' }
  },
  pink: {
    light: { bg: '#FCE7F3', border: '#DB2777' },
    dark: { bg: '#831843', border: '#F472B6' }
  },
  yellow: {
    light: { bg: '#FEF9C3', border: '#CA8A04' },
    dark: { bg: '#713F12', border: '#FACC15' }
  },
  red: {
    light: { bg: '#FEE2E2', border: '#DC2626' },
    dark: { bg: '#7F1D1D', border: '#F87171' }
  },
  teal: {
    light: { bg: '#CCFBF1', border: '#0D9488' },
    dark: { bg: '#134E4A', border: '#2DD4BF' }
  }
} as const;

const BORDER_STYLES = {
  none: { borderWidth: 0 },
  subtle: { borderWidth: 1, opacity: '40' },
  elegant: { borderWidth: 1.5, opacity: '60' },
  bold: { borderWidth: 1.9, opacity: '80' }
} as const;

const BASE_STYLE = {
  borderRadius: 8,
  margin: 6,
  shadowOpacity: 0,
  elevation: 0,
} as const;

export const ExpandableCard: React.FC<ExpandableCardProps> = React.memo(({
  title,
  children,
  style,
  variant = 'default',
  borderStyle = 'elegant',
  initialExpanded = false,
  onToggle,
  headerStyle,
  titleStyle,
  iconPosition = 'right',
  expandIcon = 'chevron-down',
  collapseIcon = 'chevron-up',
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(initialExpanded);
  const [rotateAnim] = useState(new Animated.Value(initialExpanded ? 1 : 0));

  // Memoizar estilos de la tarjeta (mismo cálculo que SimpleCard)
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

  // Obtener color del texto basado en la variante
  const textColor = useMemo(() => {
    if (variant === 'default') {
      return theme.colors.onSurface;
    }
    
    // Para variantes de color, usar texto que contraste bien
    const darkVariants = ['dark', 'green', 'blue', 'purple', 'orange', 'pink', 'red', 'teal'];
    if (theme.dark && darkVariants.includes(variant)) {
      return '#FFFFFF';
    }
    
    return variant === 'white' || variant === 'yellow' ? '#111827' : theme.colors.onSurface;
  }, [variant, theme.colors.onSurface, theme.dark]);

  const handleToggle = () => {
    const newExpanded = !expanded;
    
    // Configurar animación de layout
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
      },
    });

    // Animar rotación del ícono
    Animated.timing(rotateAnim, {
      toValue: newExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setExpanded(newExpanded);
    onToggle?.(newExpanded);
  };

  // Estilo de rotación para el ícono
  const iconRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const finalStyle = useMemo(() => [cardStyles, style], [cardStyles, style]);

  const headerContentStyle = useMemo(() => ({
    flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  }), [iconPosition]);

  const titleContainerStyle = useMemo(() => ({
    flex: 1,
    marginLeft: iconPosition === 'left' ? 8 : 0,
    marginRight: iconPosition === 'right' ? 8 : 0,
  }), [iconPosition]);

  return (
    <View style={finalStyle}>
      {/* Header clickeable */}
      <Pressable
        onPress={handleToggle}
        style={({ pressed }) => [
          headerContentStyle as any,
          headerStyle,
          {
            opacity: pressed ? 0.7 : 1,
            borderRadius: 8,
          }
        ]}
      >
        <View style={titleContainerStyle}>
          <Text 
            variant="titleMedium" 
            style={[{ color: textColor }, titleStyle]}
            numberOfLines={2}
          >
            {title}
          </Text>
        </View>
        
        <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
          <IconButton
            icon={expanded ? collapseIcon : expandIcon}
            size={20}
            iconColor={textColor}
            style={{ margin: 0 }}
          />
        </Animated.View>
      </Pressable>

      {/* Contenido expandible */}
      {expanded && (
        <View style={{
          paddingHorizontal: 12,
          paddingBottom: 12,
          paddingTop: 4,
        }}>
          {children}
        </View>
      )}
    </View>
  );
});