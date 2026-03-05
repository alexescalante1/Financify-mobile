import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, Modal, useWindowDimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface InfoTipProps {
  text: string;
  icon?: string;
  iconSize?: number;
  iconColor?: string;
  maxWidth?: number;
  position?: 'auto' | 'above' | 'below';
  children?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const TOOLTIP_MARGIN = 16;
const ARROW_SIZE = 6;

export const InfoTip: React.FC<InfoTipProps> = React.memo(({
  text,
  icon = 'information-outline',
  iconSize = 18,
  iconColor,
  maxWidth = 260,
  position = 'auto',
  children,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [visible, setVisible] = useState(false);
  const [anchorLayout, setAnchorLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const anchorRef = useRef<View>(null);

  const toggle = useCallback(() => {
    if (!visible) {
      anchorRef.current?.measureInWindow((x, y, width, height) => {
        setAnchorLayout({ x, y, width, height });
        setVisible(true);
      });
    } else {
      setVisible(false);
    }
  }, [visible]);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  const resolvedIconColor = iconColor || theme.colors.onSurfaceVariant;
  const tooltipBg = theme.colors.inverseSurface;
  const tooltipTextColor = theme.colors.inverseOnSurface;

  const tooltipPosition = useMemo(() => {
    let left = anchorLayout.x + anchorLayout.width / 2 - maxWidth / 2;
    if (left < TOOLTIP_MARGIN) left = TOOLTIP_MARGIN;
    if (left + maxWidth > screenWidth - TOOLTIP_MARGIN) left = screenWidth - TOOLTIP_MARGIN - maxWidth;

    const spaceBelow = screenHeight - (anchorLayout.y + anchorLayout.height + 8);
    const estimatedTooltipHeight = 60;

    const showAbove = position === 'above' ||
      (position === 'auto' && spaceBelow < estimatedTooltipHeight && anchorLayout.y > estimatedTooltipHeight);

    const top = showAbove
      ? anchorLayout.y - estimatedTooltipHeight - ARROW_SIZE
      : anchorLayout.y + anchorLayout.height + 8;

    const arrowLeft = anchorLayout.x + anchorLayout.width / 2 - left - ARROW_SIZE;

    return { top, left, maxWidth, showAbove, arrowLeft: Math.max(8, Math.min(arrowLeft, maxWidth - 16)) };
  }, [anchorLayout, maxWidth, screenWidth, screenHeight, position]);

  const tooltipTextStyle = useMemo(() => ({
    color: tooltipTextColor,
  }), [tooltipTextColor]);

  const arrowStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: tooltipPosition.arrowLeft,
    width: 0,
    height: 0,
    borderLeftWidth: ARROW_SIZE,
    borderRightWidth: ARROW_SIZE,
    borderLeftColor: 'transparent' as const,
    borderRightColor: 'transparent' as const,
    ...(tooltipPosition.showAbove
      ? { bottom: -ARROW_SIZE, borderTopWidth: ARROW_SIZE, borderTopColor: tooltipBg }
      : { top: -ARROW_SIZE, borderBottomWidth: ARROW_SIZE, borderBottomColor: tooltipBg }),
  }), [tooltipPosition.arrowLeft, tooltipPosition.showAbove, tooltipBg]);

  return (
    <View style={style} testID={testID}>
      <Pressable
        ref={anchorRef}
        onPress={toggle}
        accessibilityLabel={accessibilityLabel || text}
        accessibilityRole="button"
        accessibilityHint="Muestra informacion adicional"
        hitSlop={8}
      >
        {children || (
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={iconSize}
            color={resolvedIconColor}
          />
        )}
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={dismiss}>
        <Pressable style={styles.backdrop} onPress={dismiss}>
          <View
            style={[
              styles.tooltip,
              { backgroundColor: tooltipBg, top: tooltipPosition.top, left: tooltipPosition.left, maxWidth: tooltipPosition.maxWidth },
            ]}
          >
            <View style={arrowStyle} />
            <Text variant="bodySmall" style={tooltipTextStyle}>
              {text}
            </Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
});
InfoTip.displayName = 'InfoTip';

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  tooltip: {
    position: 'absolute',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
