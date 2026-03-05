import React, { useEffect, useRef, useCallback, useMemo, ReactNode, useState } from 'react';
import {
  View,
  Modal,
  Animated,
  Pressable,
  StyleSheet,
  ViewStyle,
  useWindowDimensions,
  PanResponder,
  KeyboardAvoidingView,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';

interface FinancifyBottomSheetProps {
  visible: boolean;
  onDismiss: () => void;
  snapPoints?: (string | number)[];
  title?: string;
  children: ReactNode;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

const parseSnapPoint = (snap: string | number, screenHeight: number): number => {
  if (typeof snap === 'number') return snap;
  if (snap.endsWith('%')) {
    return (parseFloat(snap) / 100) * screenHeight;
  }
  return screenHeight * 0.4;
};

export const FinancifyBottomSheet: React.FC<FinancifyBottomSheetProps> = React.memo(({
  visible,
  onDismiss,
  snapPoints: snapPointsProp,
  title,
  children,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  // translateY model: 0 = visible at bottom, positive = pushed down (hidden)
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [shouldRender, setShouldRender] = useState(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const currentTranslateY = useRef(screenHeight);
  const sheetHeightRef = useRef(0);

  const snapHeights = useMemo(() => {
    const snaps = snapPointsProp || ['40%', '70%'];
    return snaps
      .map(s => parseSnapPoint(s, screenHeight))
      .sort((a, b) => a - b);
  }, [snapPointsProp, screenHeight]);

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  const animateTo = useCallback((toY: number, onComplete?: () => void) => {
    cleanup();
    const isHiding = toY >= sheetHeightRef.current;
    animationRef.current = Animated.parallel([
      Animated.spring(translateY, {
        toValue: toY,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
      Animated.timing(backdropOpacity, {
        toValue: isHiding ? 0 : 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);
    animationRef.current.start(({ finished }) => {
      if (finished) {
        currentTranslateY.current = toY;
        onComplete?.();
      }
    });
  }, [cleanup, translateY, backdropOpacity]);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const measuredHeight = e.nativeEvent.layout.height;
    if (measuredHeight > 0 && sheetHeightRef.current === 0) {
      sheetHeightRef.current = measuredHeight;
      // Now that we know the height, animate into view
      animateTo(0);
    }
  }, [animateTo]);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      sheetHeightRef.current = 0; // reset so onLayout triggers animation
      translateY.setValue(screenHeight); // start hidden below
      currentTranslateY.current = screenHeight;
    } else if (shouldRender) {
      const hideY = sheetHeightRef.current || screenHeight;
      animateTo(hideY, () => {
        setShouldRender(false);
      });
    }
    return cleanup;
  }, [visible, shouldRender, screenHeight, translateY, animateTo, cleanup]);

  const panResponder = useMemo(() => {
    let startY = 0;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 5,
      onPanResponderGrant: () => {
        startY = currentTranslateY.current;
      },
      onPanResponderMove: (_, gestureState) => {
        // Clamp: can't drag above 0 (fully shown), can drag down freely
        const newY = Math.max(0, startY + gestureState.dy);
        translateY.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentY = startY + gestureState.dy;
        const velocity = gestureState.vy;
        const sheetH = sheetHeightRef.current || screenHeight;

        // Dismiss if dragged down fast or past 50% of sheet height
        if (velocity > 1.5 || currentY > sheetH * 0.5) {
          onDismiss();
          return;
        }

        // Snap back to fully visible
        animateTo(0);
      },
    });
  }, [screenHeight, translateY, animateTo, onDismiss]);

  const handleIndicatorStyle = useMemo(() => ({
    backgroundColor: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  const sheetStyle = useMemo(() => ({
    backgroundColor: theme.colors.surface,
    maxHeight: screenHeight * 0.9,
    shadowColor: theme.colors.shadow,
  }), [theme.colors.surface, screenHeight, theme.colors.shadow]);

  if (!shouldRender) return null;

  return (
    <Modal
      visible={shouldRender}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={styles.backdropPress} onPress={onDismiss} />
        </Animated.View>

        {/* Sheet — absolute bottom, translateY pushes down to hide */}
        <Animated.View
          onLayout={handleLayout}
          style={[
            styles.sheet,
            sheetStyle,
            { transform: [{ translateY }] },
          ]}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
        >
          {/* Handle */}
          <View style={styles.handleContainer} {...panResponder.panHandlers}>
            <View style={[styles.handle, handleIndicatorStyle]} />
          </View>

          {/* Header */}
          {title ? (
            <View style={styles.header}>
              <Text variant="titleMedium" style={styles.title}>{title}</Text>
              <IconButton icon="close" size={20} onPress={onDismiss} accessibilityLabel="Cerrar" />
            </View>
          ) : null}

          {/* Content */}
          <View style={[styles.content, style]}>
            {children}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});
FinancifyBottomSheet.displayName = 'FinancifyBottomSheet';

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,1)',
  },
  backdropPress: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 16,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
