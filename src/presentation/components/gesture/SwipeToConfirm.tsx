import React, { useRef, useCallback, useMemo, useEffect } from 'react';
import { View, Animated, PanResponder, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { AppTheme } from '@/presentation/theme/materialTheme';
import { withAlpha } from '@/presentation/theme/colorUtils';

interface SwipeToConfirmProps {
  onConfirm: () => void;
  label?: string;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  height?: number;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const THUMB_SIZE = 52;
const THRESHOLD_RATIO = 0.85;

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = React.memo(({
  onConfirm,
  label = 'Desliza para confirmar',
  icon = 'arrow-right',
  disabled = false,
  loading = false,
  height = 56,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];

  const translateX = useRef(new Animated.Value(0)).current;
  const containerWidth = useRef(0);
  const confirmedRef = useRef(false);
  const onConfirmRef = useRef(onConfirm);
  onConfirmRef.current = onConfirm;

  // Reset when disabled or loading changes (e.g. after a failed confirm)
  useEffect(() => {
    if (disabled || loading) {
      confirmedRef.current = false;
      translateX.stopAnimation();
      translateX.setValue(0);
    }
  }, [disabled, loading, translateX]);

  const handleLayout = useCallback((e: { nativeEvent: { layout: { width: number } } }) => {
    containerWidth.current = e.nativeEvent.layout.width;
  }, []);

  const resetThumb = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled && !loading && !confirmedRef.current,
    onMoveShouldSetPanResponder: () => !disabled && !loading && !confirmedRef.current,
    onPanResponderMove: (_, gestureState) => {
      const maxX = containerWidth.current - THUMB_SIZE - 8;
      const clampedX = Math.max(0, Math.min(gestureState.dx, maxX));
      translateX.setValue(clampedX);
    },
    onPanResponderRelease: (_, gestureState) => {
      const maxX = containerWidth.current - THUMB_SIZE - 8;
      if (gestureState.dx >= maxX * THRESHOLD_RATIO) {
        confirmedRef.current = true;
        Animated.spring(translateX, {
          toValue: maxX,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }).start(() => {
          onConfirmRef.current();
        });
      } else {
        resetThumb();
      }
    },
  }), [disabled, loading, translateX, resetThumb]);

  const trackStyle = useMemo(() => ({
    height,
    backgroundColor: disabled ? theme.colors.surfaceVariant : withAlpha(colors.success, 0.13),
    borderRadius: height / 2,
    borderWidth: 1,
    borderColor: disabled ? theme.colors.outlineVariant : withAlpha(colors.success, 0.25),
  }), [height, disabled, theme.colors.surfaceVariant, theme.colors.outlineVariant, colors.success]);

  const thumbStyle = useMemo(() => ({
    width: THUMB_SIZE,
    height: THUMB_SIZE - 8,
    borderRadius: (THUMB_SIZE - 8) / 2,
    backgroundColor: disabled ? theme.colors.onSurfaceVariant : colors.success,
    shadowColor: theme.colors.shadow,
  }), [disabled, theme.colors.onSurfaceVariant, colors.success, theme.colors.shadow]);

  const labelStyle = useMemo(() => ({
    color: disabled ? theme.colors.onSurfaceVariant : colors.success,
  }), [disabled, theme.colors.onSurfaceVariant, colors.success]);

  return (
    <View
      style={[styles.container, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || label}
      onLayout={handleLayout}
    >
      <View style={[styles.track, trackStyle]}>
        <Text variant="bodyMedium" style={[styles.label, labelStyle]}>
          {loading ? 'Procesando...' : label}
        </Text>
        <Animated.View
          style={[styles.thumb, thumbStyle, { transform: [{ translateX }] }]}
          {...panResponder.panHandlers}
        >
          {loading ? (
            <MaterialCommunityIcons name="loading" size={24} color={theme.colors.onPrimary} />
          ) : (
            <MaterialCommunityIcons
              name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={24}
              color={theme.colors.onPrimary}
            />
          )}
        </Animated.View>
      </View>
    </View>
  );
});
SwipeToConfirm.displayName = 'SwipeToConfirm';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  label: {
    fontWeight: '600',
    position: 'absolute',
  },
  thumb: {
    position: 'absolute',
    left: 4,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
});
