import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { View, ViewStyle, TextStyle, StyleSheet, Pressable, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTheme, Text, IconButton } from 'react-native-paper';
import {
  CardVariant,
  CardBorderStyle,
  COLOR_PALETTE,
  BORDER_STYLES,
  BASE_CARD_STYLE,
} from './cardConstants';

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
  borderStyle?: CardBorderStyle;
  initialExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
  headerStyle?: ViewStyle;
  titleStyle?: TextStyle;
  iconPosition?: 'left' | 'right';
  /** @deprecated Icon is controlled by rotation animation */
  expandIcon?: string;
  /** @deprecated Icon is controlled by rotation animation */
  collapseIcon?: string;
  numberOfLines?: number;
  testID?: string;
  accessibilityLabel?: string;
}

// LayoutAnimation is natively supported in New Architecture; only needed for old arch
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental &&
  !(global as any)._IS_FABRIC
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  numberOfLines = 2,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(initialExpanded);
  const rotateAnim = useRef(new Animated.Value(initialExpanded ? 1 : 0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    return () => animRef.current?.stop();
  }, []);

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
      backgroundColor,
      ...borderStyles,
    };
  }, [variant, borderStyle, theme.colors.surface, theme.colors.outlineVariant, theme.dark]);

  const textColor = useMemo(() => {
    if (variant === 'default') {
      return theme.colors.onSurface;
    }

    const colors = COLOR_PALETTE[variant as keyof typeof COLOR_PALETTE];
    const themeColors = theme.dark ? colors.dark : colors.light;
    return themeColors.text;
  }, [variant, theme.colors.onSurface, theme.dark]);

  const handleToggle = useCallback(() => {
    setExpanded(prev => {
      const newExpanded = !prev;

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

      animRef.current?.stop();
      animRef.current = Animated.timing(rotateAnim, {
        toValue: newExpanded ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      });
      animRef.current.start();

      onToggle?.(newExpanded);
      return newExpanded;
    });
  }, [rotateAnim, onToggle]);

  const iconRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const finalStyle = useMemo(() => [cardStyles, style], [cardStyles, style]);

  const headerContentStyle = useMemo((): ViewStyle => ({
    flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: 2,
  }), [iconPosition]);

  const titleContainerStyle = useMemo(() => ({
    flex: 1,
    marginLeft: iconPosition === 'left' ? 8 : 0,
    marginRight: iconPosition === 'right' ? 8 : 0,
  }), [iconPosition]);

  const titleColorStyle = useMemo(() => ({ color: textColor }), [textColor]);

  const rotateStyle = useMemo(() => ({
    transform: [{ rotate: iconRotation }],
  }), [iconRotation]);

  return (
    <View
      style={finalStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <Pressable
        onPress={handleToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={({ pressed }) => [
          headerContentStyle,
          headerStyle,
          pressed && styles.pressed,
          styles.pressable,
        ]}
      >
        <View style={titleContainerStyle}>
          <Text
            variant="titleMedium"
            style={[titleColorStyle, titleStyle]}
            numberOfLines={numberOfLines}
          >
            {title}
          </Text>
        </View>

        <Animated.View style={rotateStyle}>
          <IconButton
            icon="chevron-down"
            size={20}
            iconColor={textColor}
            style={styles.iconButton}
          />
        </Animated.View>
      </Pressable>

      {expanded && (
        <View style={styles.expandedContent}>
          {children}
        </View>
      )}
    </View>
  );
});
ExpandableCard.displayName = 'ExpandableCard';

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  iconButton: {
    margin: 0,
  },
  expandedContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 4,
  },
});
