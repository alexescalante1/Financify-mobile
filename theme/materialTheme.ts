import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Paleta de colores financieros BONITOS y elegantes
const financialColorsPastel = {
  // Celeste elegante balanceado (confianza, serenidad)
  celesteMain: '#42A5F5',       // Celeste elegante - balance perfecto
  celesteLight: '#E3F2FD',      // Celeste muy claro
  celesteDark: '#1E88E5',       // Celeste más definido
  
  // Verde success más tradicional (ganancias, positivo)
  successGreen: '#4CAF50',      // Verde success clásico
  successGreenLight: '#C8E6C9', // Verde success claro
  successGreenDark: '#388E3C',  // Verde success oscuro
  
  // Coral suave bonito (pérdidas, advertencias)
  coralSoft: '#FF7043',         // Coral suave hermoso
  coralLight: '#FFCCBC',        // Coral muy claro
  coralDark: '#D84315',         // Coral más intenso
  
  // Lavanda bonita (premium, elegancia)
  lavender: '#BA68C8',          // Lavanda hermosa
  lavenderLight: '#F3E5F5',     // Lavanda muy claro
  lavenderDark: '#8E24AA',      // Lavanda más intenso
  
  // Durazno suave (alertas, información)
  peachSoft: '#FFB74D',         // Durazno suave
  peachLight: '#FFF3E0',        // Durazno muy claro
  peachDark: '#F57C00',         // Durazno más intenso
  
  // Gris perla (neutral, elegante)
  pearlGray: '#90A4AE',         // Gris perla bonito
  pearlGrayLight: '#F5F5F5',    // Gris perla claro
  pearlGrayDark: '#546E7A',     // Gris perla oscuro
  
  // Turquesa suave (información, frescura)
  turquoise: '#4DD0E1',         // Turquesa bonita
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    
    // Colores principales - Celeste bonito y sereno
    primary: financialColorsPastel.celesteMain,
    onPrimary: '#FFFFFF',
    primaryContainer: financialColorsPastel.celesteLight,
    onPrimaryContainer: financialColorsPastel.celesteDark,
    
    // Colores secundarios - Verde success tradicional
    secondary: financialColorsPastel.successGreen,
    onSecondary: '#FFFFFF',
    secondaryContainer: financialColorsPastel.successGreenLight,
    onSecondaryContainer: financialColorsPastel.successGreenDark,
    
    // Colores terciarios - Lavanda premium
    tertiary: financialColorsPastel.lavender,
    onTertiary: '#FFFFFF',
    tertiaryContainer: financialColorsPastel.lavenderLight,
    onTertiaryContainer: financialColorsPastel.lavenderDark,
    
    // Superficies y fondos - Blancos más cálidos
    surface: '#FEFEFE',
    onSurface: '#1C1B1F',
    surfaceVariant: '#F8F9FA',
    onSurfaceVariant: '#49454F',
    surfaceTint: financialColorsPastel.celesteMain,
    
    // Fondo principal más cálido
    background: '#FFFFFF',
    onBackground: '#1C1B1F',
    
    // Estados de error - Coral suave y bonito
    error: financialColorsPastel.coralSoft,
    onError: '#FFFFFF',
    errorContainer: financialColorsPastel.coralLight,
    onErrorContainer: financialColorsPastel.coralDark,
    
    // Bordes y divisores más suaves
    outline: '#B0BEC5',
    outlineVariant: '#E0E0E0',
    
    // Estados especiales para finanzas - Colores bonitos
    success: financialColorsPastel.successGreen,
    onSuccess: '#FFFFFF',
    warning: financialColorsPastel.peachSoft,
    onWarning: '#FFFFFF',
    info: financialColorsPastel.turquoise,
    onInfo: '#FFFFFF',
    
    // Colores específicos para gráficos financieros - Bonitos
    profit: financialColorsPastel.successGreen,
    loss: financialColorsPastel.coralSoft,
    neutral: financialColorsPastel.pearlGray,
    
    // Elevation shadows más sutiles
    shadow: 'rgba(0, 0, 0, 0.06)',
    scrim: 'rgba(0, 0, 0, 0.25)',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    
    // Colores principales - Celeste elegante balanceado para dark mode
    primary: '#64B5F6',           // Celeste balanceado para dark
    onPrimary: '#0D47A1',
    primaryContainer: '#1976D2',
    onPrimaryContainer: '#BBDEFB',
    
    // Colores secundarios - Verde success para dark
    secondary: '#81C784',         // Verde success para dark
    onSecondary: '#1B5E20',
    secondaryContainer: '#388E3C',
    onSecondaryContainer: '#C8E6C9',
    
    // Colores terciarios - Lavanda suave
    tertiary: '#CE93D8',          // Lavanda para dark
    onTertiary: '#4A148C',
    tertiaryContainer: '#7B1FA2',
    onTertiaryContainer: '#F8BBD9',
    
    // Superficies oscuras más cálidas
    surface: '#1A1A1A',
    onSurface: '#E5E5E5',
    surfaceVariant: '#2A2A2A',
    onSurfaceVariant: '#C0C0C0',
    surfaceTint: '#81D4FA',
    
    // Fondo principal oscuro más cálido
    background: '#121212',
    onBackground: '#E5E5E5',
    
    // Estados de error en dark mode - Coral suave
    error: '#FFAB91',            // Coral suave para dark
    onError: '#BF360C',
    errorContainer: '#D84315',
    onErrorContainer: '#FFE0B2',
    
    // Bordes y divisores para dark mode - Más suaves
    outline: '#78909C',
    outlineVariant: '#37474F',
    
    // Estados especiales para finanzas en dark mode - Bonitos
    success: '#81C784',
    onSuccess: '#FFFFFF',
    warning: '#FFCC02',
    onWarning: '#FFFFFF', 
    info: '#4FC3F7',
    onInfo: '#FFFFFF',
    
    // Colores específicos para gráficos financieros dark - Bonitos
    profit: '#81C784',
    loss: '#FFAB91',
    neutral: '#90A4AE',
    
    // Shadows para dark mode - Más sutiles
    shadow: 'rgba(0, 0, 0, 0.3)',
    scrim: 'rgba(0, 0, 0, 0.5)',
  },
};