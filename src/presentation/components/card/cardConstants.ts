import { ViewStyle } from 'react-native';

export type CardVariant =
  | 'default'
  | 'white'
  | 'dark'
  | 'green'
  | 'blue'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'yellow'
  | 'red'
  | 'teal';

export type CardBorderStyle = 'none' | 'subtle' | 'elegant' | 'bold';

export const COLOR_PALETTE = {
  white: {
    light: { bg: '#FFFFFF', border: '#E5E7EB', text: '#111827' },
    dark: { bg: '#F9FAFB', border: '#D1D5DB', text: '#111827' }
  },
  dark: {
    light: { bg: '#111827', border: '#374151', text: '#FFFFFF' },
    dark: { bg: '#0F172A', border: '#475569', text: '#FFFFFF' }
  },
  green: {
    light: { bg: '#DCFCE7', border: '#22C55E', text: '#111827' },
    dark: { bg: '#14532D', border: '#4ADE80', text: '#FFFFFF' }
  },
  blue: {
    light: { bg: '#E0F2FE', border: '#0EA5E9', text: '#111827' },
    dark: { bg: '#1E3A8A', border: '#38BDF8', text: '#FFFFFF' }
  },
  purple: {
    light: { bg: '#F3E8FF', border: '#9333EA', text: '#111827' },
    dark: { bg: '#581C87', border: '#C084FC', text: '#FFFFFF' }
  },
  orange: {
    light: { bg: '#FFEDD5', border: '#EA580C', text: '#111827' },
    dark: { bg: '#7C2D12', border: '#FB923C', text: '#FFFFFF' }
  },
  pink: {
    light: { bg: '#FCE7F3', border: '#DB2777', text: '#111827' },
    dark: { bg: '#831843', border: '#F472B6', text: '#FFFFFF' }
  },
  yellow: {
    light: { bg: '#FEF9C3', border: '#CA8A04', text: '#111827' },
    dark: { bg: '#713F12', border: '#FACC15', text: '#FFFFFF' }
  },
  red: {
    light: { bg: '#FEE2E2', border: '#DC2626', text: '#111827' },
    dark: { bg: '#7F1D1D', border: '#F87171', text: '#FFFFFF' }
  },
  teal: {
    light: { bg: '#CCFBF1', border: '#0D9488', text: '#111827' },
    dark: { bg: '#134E4A', border: '#2DD4BF', text: '#FFFFFF' }
  }
} as const;

export const BORDER_STYLES = {
  none: { borderWidth: 0 },
  subtle: { borderWidth: 1, opacity: '66' },
  elegant: { borderWidth: 1.5, opacity: '99' },
  bold: { borderWidth: 1.9, opacity: 'CC' }
} as const;

export const BASE_CARD_STYLE: ViewStyle = {
  borderRadius: 8,
  margin: 6,
  shadowOpacity: 0,
  elevation: 0,
};
