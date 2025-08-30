// theme.ts
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

//
// 🎨 Paleta base (coherente y agradable para finanzas)
//
const Palette = {
  // Primary (celeste financiero)
  primary:            '#2E90FA',
  primaryLightText:   '#1A275F',
  primaryLightBg:     '#EAF2FF',
  primaryDark:        '#84C5FF',
  primaryDarkText:    '#0B2B4A',
  primaryDarkBg:      '#0B2742',
  
  // Success (verde saludable)
  success:            '#16B364',
  successLightBg:     '#D1FADF',
  successDarkBg:      '#0B2E1E',

  // Error / Loss (coral suave)
  error:              '#F97066',
  errorLightBg:       '#FFE6E2',
  errorDarkBg:        '#3C1010',

  // Tertiary (lavanda elegante)
  tertiary:           '#8D5CF6',
  tertiaryLightBg:    '#EEE5FF',
  tertiaryDarkBg:     '#2B1F51',

  // Warning / Info
  warning:            '#F79009',
  warningLightBg:     '#FFF4E5',
  warningDarkBg:      '#4A2E00',

  info:               '#06AED4',
  infoLightBg:        '#E0F7FD',
  infoDarkBg:         '#062B33',

  // Neutros
  white:              '#FFFFFF',
  black:              '#000000',
  onLight:            '#0F1728',  // texto principal en claro
  onDark:             '#E6E8EB',  // texto principal en oscuro
  surfaceVarL:        '#F7F7FA',
  onSurfaceVarL:      '#475467',
  outlineL:           '#D0D5DD',
  outlineVarL:        '#E4E7EC',

  surfaceVarD:        '#0B0F14',
  onSurfaceVarD:      '#98A2B3',
  outlineD:           '#3A4151',
  outlineVarD:        '#1F2430',

  neutral:            '#98A2B3',
};

//
// 🔧 Tipo de tema extendido (para evitar "any" al agregar colores propios)
//
export type AppTheme = MD3Theme & {
  colors: MD3Theme['colors'] & {
    success: string; onSuccess: string;
    warning: string; onWarning: string;
    info: string; onInfo: string;
    profit: string; loss: string; neutral: string;
  };
};

//
// ☀️ LIGHT — fondos puros, acentos limpios
//
export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    // Fondos/Superficies: blanco puro (sin "plomo")
    background: Palette.white,
    onBackground: Palette.onLight,
    surface: Palette.white,
    onSurface: Palette.onLight,
    surfaceVariant: Palette.surfaceVarL,
    onSurfaceVariant: Palette.onSurfaceVarL,
    surfaceTint: 'transparent', // ← sin overlay MD3

    // Primary
    primary: Palette.primary,
    onPrimary: Palette.white,
    primaryContainer: Palette.primaryLightBg,
    onPrimaryContainer: Palette.primaryLightText,

    // Secondary (usamos verde éxito como secundario)
    secondary: Palette.success,
    onSecondary: Palette.white,
    secondaryContainer: Palette.successLightBg,
    onSecondaryContainer: '#0E4B34',

    // Tertiary
    tertiary: Palette.tertiary,
    onTertiary: Palette.white,
    tertiaryContainer: Palette.tertiaryLightBg,
    onTertiaryContainer: '#3A1D7A',

    // Error
    error: Palette.error,
    onError: Palette.white,
    errorContainer: Palette.errorLightBg,
    onErrorContainer: '#7C2D12',

    // Bordes / sombras
    outline: Palette.outlineL,
    outlineVariant: Palette.outlineVarL,
    shadow: 'rgba(0,0,0,0.06)',
    scrim: 'rgba(0,0,0,0.25)',

    // Extras semánticos
    success: Palette.success,
    onSuccess: Palette.white,
    warning: Palette.warning,
    onWarning: Palette.onLight,
    info: Palette.info,
    onInfo: Palette.white,

    // Gráficos
    profit: Palette.success,
    loss: Palette.error,
    neutral: Palette.neutral,
  },
} as AppTheme;

//
// 🌙 DARK — negro real, acentos legibles
//
export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,

    // Fondos/Superficies: negro puro
    background: Palette.black,
    onBackground: Palette.onDark,
    surface: Palette.black,
    onSurface: Palette.onDark,
    surfaceVariant: Palette.surfaceVarD,
    onSurfaceVariant: Palette.onSurfaceVarD,
    surfaceTint: 'transparent', // ← sin overlay MD3

    // Primary (más luminoso en dark)
    primary: Palette.primaryDark,
    onPrimary: Palette.primaryDarkText,
    primaryContainer: Palette.primaryDarkBg,
    onPrimaryContainer: '#CFE8FF',

    // Secondary (success en dark)
    secondary: '#81D8AE',
    onSecondary: '#0C2C20',
    secondaryContainer: Palette.successDarkBg,
    onSecondaryContainer: '#CFF6E3',

    // Tertiary
    tertiary: '#B399FF',
    onTertiary: '#23123F',
    tertiaryContainer: Palette.tertiaryDarkBg,
    onTertiaryContainer: '#EBD9FF',

    // Error
    error: '#FF9A7A',
    onError: '#3B0E05',
    errorContainer: Palette.errorDarkBg,
    onErrorContainer: '#FFD7CC',

    // Bordes / sombras
    outline: Palette.outlineD,
    outlineVariant: Palette.outlineVarD,
    shadow: 'rgba(0,0,0,0.3)',
    scrim: 'rgba(0,0,0,0.5)',

    // Extras semánticos
    success: '#81D8AE',
    onSuccess: Palette.black,
    warning: '#FFCC02',
    onWarning: Palette.black,
    info: '#7ADBE8',
    onInfo: Palette.black,

    // Gráficos
    profit: '#81D8AE',
    loss: '#FF9A7A',
    neutral: '#9AA5B1',
  },
} as AppTheme;
