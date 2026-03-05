/**
 * Appends a hex-alpha channel to a #RRGGBB color string.
 * @param hexColor  – A 6-digit hex color, e.g. '#FF5500'
 * @param opacity   – 0..1 opacity value
 * @returns `#RRGGBBAA` string, or the original color if not a valid 7-char hex
 */
export const withAlpha = (hexColor: string, opacity: number): string => {
  if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
    return hexColor || 'transparent';
  }
  const clamped = Math.min(1, Math.max(0, opacity));
  const hex = Math.round(clamped * 255).toString(16).padStart(2, '0');
  return hexColor + hex;
};
