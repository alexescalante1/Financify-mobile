// theme.ts
import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';

//
// 🎨 Paleta base (coherente y agradable para finanzas)
//
const Palette = {
  // Primary — celeste + punch
  primary:            '#00BEFF',   // más vibrante
  primaryLightText:   '#0B2B52',
  primaryLightBg:     '#D9F2FF',   // +luz y +saturación
  primaryDark:        '#00C6FF',   // acento en dark más luminoso
  primaryDarkText:    '#001A2F',
  primaryDarkBg:      '#002546',

  // Success — verde fresco y brillante
  success:            '#00D18F',
  successLightBg:     '#CFFBE9',
  successDarkBg:      '#053427',

  // Error — rojo/coral más vivo
  error:              '#FF2A5F',
  errorLightBg:       '#FFD4E6',
  errorDarkBg:        '#3C1014',

  // Tertiary — violeta eléctrico
  tertiary:           '#8B5CF6',
  tertiaryLightBg:    '#EEE7FF',
  tertiaryDarkBg:     '#2A1B57',

  // Warning / Info más intensos
  warning:            '#FFBE0B',
  warningLightBg:     '#FFF4CC',
  warningDarkBg:      '#422C00',

  info:               '#06B6D4',   // cian vivo
  infoLightBg:        '#D9FAFF',
  infoDarkBg:         '#06343D',

  // Neutros (ligero boost en contraste)
  white:              '#FFFFFF',
  black:              '#000000',
  onLight:            '#0D1825',
  onDark:             '#F2F6FB',
  surfaceVarL:        '#F6F9FC',
  onSurfaceVarL:      '#3F4A5A',
  outlineL:           '#C9D1DA',
  outlineVarL:        '#E1E7EF',

  surfaceVarD:        '#0C1017',
  onSurfaceVarD:      '#BAC4D3',
  outlineD:           '#414A58',
  outlineVarD:        '#1C2330',

  neutral:            '#97A3AF',
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

    // Fondos / Superficies
    background: Palette.black,       // Negro real para el fondo
    onBackground: Palette.onDark,
    surface: '#000113',              // ← diferente a background
    onSurface: Palette.onDark,
    surfaceVariant: '#111722',       // tono apenas más claro que surface
    onSurfaceVariant: Palette.onSurfaceVarD,

    // Escala MD3 de contenedores (para cards por elevación)
    surfaceContainerLowest: '#000000',
    surfaceContainerLow:   '#0B1119',
    surfaceContainer:      '#0F1621',
    surfaceContainerHigh:  '#121A26',
    surfaceContainerHighest:'#151F2C',

    // Trae de vuelta el overlay MD3 con un tinte celeste suave
    surfaceTint: 'rgba(90, 184, 255, 0.14)',  // ~ Palette.primaryDark con 14%

    // Primary (más luminoso en dark)
    primary: Palette.primaryDark,         // #5AB8FF
    onPrimary: Palette.primaryDarkText,   // #001A33
    primaryContainer: Palette.primaryDarkBg, // #002C50
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
    error: Palette.error,
    onError: '#FFD7CC',
    errorContainer: Palette.errorDarkBg,
    onErrorContainer: '#FFD7CC',

    // Bordes / sombras
    outline: Palette.outlineD,
    outlineVariant: Palette.outlineVarD,
    shadow: 'rgba(0,0,0,0.35)',
    scrim: 'rgba(0,0,0,0.55)',

    // Extras semánticos más vibrantes en dark
    success: '#27D99C',
    onSuccess: Palette.black,
    warning: '#FFCC02',
    onWarning: Palette.black,
    info: '#33E1F2',
    onInfo: Palette.black,

    // Gráficos
    profit: '#27D99C',
    loss: '#FF9A7A',
    neutral: '#9AA5B1',
  },
} as AppTheme;
