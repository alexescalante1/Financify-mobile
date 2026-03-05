import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Badge as PaperBadge, useTheme } from 'react-native-paper';

type BadgeSize = 'sm' | 'md' | 'lg';

const SIZE_MAP: Record<BadgeSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

interface BadgeProps {
  count?: number;
  maxCount?: number;
  visible?: boolean;
  color?: string;
  textColor?: string;
  size?: BadgeSize;
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const Badge: React.FC<BadgeProps> = React.memo(({
  count,
  maxCount = 99,
  visible = true,
  color,
  textColor,
  size = 'md',
  children,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    const anim = Animated.spring(scaleAnim, {
      toValue: visible ? 1 : 0,
      useNativeDriver: true,
      tension: 150,
      friction: 8,
    });
    anim.start();
    return () => anim.stop();
  }, [visible, scaleAnim]);

  const badgeSize = SIZE_MAP[size];
  const displayText = count !== undefined
    ? (count > maxCount ? `${maxCount}+` : `${count}`)
    : undefined;

  const badgeColor = color || theme.colors.error;

  const badgeStyle = useMemo(() => [
    children ? styles.positioned : undefined,
    { transform: [{ scale: scaleAnim }] },
  ], [children, scaleAnim]);

  const badge = (
    <Animated.View style={badgeStyle}>
      <PaperBadge
        visible
        size={badgeSize}
        style={[
          { backgroundColor: badgeColor },
          textColor ? { color: textColor } : undefined,
          style,
        ]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      >
        {displayText}
      </PaperBadge>
    </Animated.View>
  );

  if (!children) return badge;

  return (
    <View style={styles.wrapper}>
      {children}
      {badge}
    </View>
  );
});

Badge.displayName = 'Badge';

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  positioned: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 1,
  },
});
