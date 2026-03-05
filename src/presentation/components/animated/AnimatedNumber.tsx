import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TextStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

type TextVariant = 'bodySmall' | 'bodyMedium' | 'bodyLarge' | 'titleSmall' | 'titleMedium' | 'titleLarge' | 'headlineSmall' | 'headlineMedium' | 'headlineLarge' | 'displaySmall';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimalPlaces?: number;
  locale?: string;
  textVariant?: TextVariant;
  color?: string;
  style?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const formatNumber = (num: number, decimalPlaces: number, locale: string): string => {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(num);
};

export const AnimatedNumber: React.FC<AnimatedNumberProps> = React.memo(({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  decimalPlaces = 2,
  locale = 'es-PE',
  textVariant = 'headlineMedium',
  color,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const [displayValue, setDisplayValue] = useState(formatNumber(value, decimalPlaces, locale));
  const startValueRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = startValueRef.current;
    const endValue = value;

    if (startValue === endValue) {
      setDisplayValue(formatNumber(endValue, decimalPlaces, locale));
      return;
    }

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = easeOutCubic(progress);
      const current = startValue + (endValue - startValue) * easedProgress;

      setDisplayValue(formatNumber(current, decimalPlaces, locale));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        startValueRef.current = endValue;
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      startValueRef.current = value;
    };
  }, [value, duration, decimalPlaces, locale]);

  const textColor = color || theme.colors.onSurface;

  const textStyle = useMemo(() => ({
    color: textColor,
    fontWeight: '600' as const,
  }), [textColor]);

  const fullText = `${prefix}${displayValue}${suffix}`;

  return (
    <Text
      variant={textVariant}
      style={[textStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || fullText}
    >
      {fullText}
    </Text>
  );
});
AnimatedNumber.displayName = 'AnimatedNumber';
