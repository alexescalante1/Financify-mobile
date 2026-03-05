import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { FAB, useTheme } from 'react-native-paper';

type FABSize = 'small' | 'medium' | 'large';
type FABPosition = 'bottom-right' | 'bottom-center' | 'bottom-left';

interface FABActionProps {
  icon?: string;
  label?: string;
  onPress: () => void;
  visible?: boolean;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
  backgroundColor?: string;
  size?: FABSize;
  position?: FABPosition;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const POSITION_STYLES: Record<FABPosition, ViewStyle> = {
  'bottom-right': { right: 16 },
  'bottom-center': { alignSelf: 'center', right: undefined, left: undefined },
  'bottom-left': { left: 16 },
};

export const FABAction: React.FC<FABActionProps> = React.memo(({
  icon = 'plus',
  label,
  onPress,
  visible = true,
  loading = false,
  disabled = false,
  color,
  backgroundColor,
  size = 'medium',
  position = 'bottom-right',
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

  const fabColor = useMemo(() => color || theme.colors.onPrimary, [color, theme.colors.onPrimary]);
  const fabBg = useMemo(() => backgroundColor || theme.colors.primary, [backgroundColor, theme.colors.primary]);
  const positionStyle = useMemo(() => POSITION_STYLES[position], [position]);

  const containerStyle = useMemo(() => [
    styles.container,
    positionStyle,
    { transform: [{ scale: scaleAnim }] },
  ], [positionStyle, scaleAnim]);

  const fabStyle = useMemo(() => [
    { backgroundColor: fabBg },
    size === 'large' && styles.largeFab,
    style,
  ], [fabBg, size, style]);

  const fabSize = size === 'small' ? 'small' : 'medium';

  return (
    <Animated.View style={containerStyle}>
      <FAB
        icon={icon}
        label={label}
        onPress={onPress}
        loading={loading}
        disabled={disabled}
        color={fabColor}
        size={fabSize}
        style={fabStyle}
        testID={testID}
        accessibilityLabel={accessibilityLabel || label || 'Accion'}
      />
    </Animated.View>
  );
});

FABAction.displayName = 'FABAction';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    zIndex: 10,
  },
  largeFab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
