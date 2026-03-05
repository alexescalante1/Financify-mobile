import React, { useEffect, useRef, useMemo, ReactNode } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";
import {
  Modal,
  Portal,
  IconButton,
  useTheme,
} from "react-native-paper";

const NO_SHADOW: ViewStyle = {
  elevation: 0,
  shadowColor: 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
};

interface AnimatedDialogProps {
  visible: boolean;
  onDismiss: () => void;
  dismissable?: boolean;
  showCloseButton?: boolean;
  closeLabel?: string;
  children: ReactNode;
  maxWidth?: number;
  backgroundColor?: string;
  borderRadius?: number;
  testID?: string;
  accessibilityLabel?: string;
}

export const AnimatedDialog: React.FC<AnimatedDialogProps> = React.memo(({
  visible,
  onDismiss,
  dismissable = true,
  showCloseButton = true,
  closeLabel = 'Cerrar',
  children,
  maxWidth,
  backgroundColor,
  borderRadius = 12,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = visible
      ? Animated.parallel([
          Animated.spring(scaleValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      : Animated.parallel([
          Animated.timing(scaleValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]);
    anim.start();
    return () => anim.stop();
  }, [visible, scaleValue, opacityValue]);

  const containerStyle = useMemo(() => ({
    ...NO_SHADOW,
    backgroundColor: 'transparent' as const,
    margin: 20,
    borderRadius,
    ...(maxWidth && { maxWidth, alignSelf: 'center' as const }),
  }), [borderRadius, maxWidth]);

  const animatedViewStyle = useMemo(() => ({
    transform: [{ scale: scaleValue }],
    opacity: opacityValue,
    backgroundColor: backgroundColor || theme.colors.surface,
    borderRadius,
    ...NO_SHADOW,
  }), [scaleValue, opacityValue, backgroundColor, theme.colors.surface, borderRadius]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        dismissable={dismissable}
        style={styles.modal}
        contentContainerStyle={containerStyle}
        testID={testID}
      >
        <Animated.View style={animatedViewStyle}>
          <Animated.View
            style={styles.content}
            accessibilityLabel={accessibilityLabel}
          >
            {showCloseButton && (
              <IconButton
                icon="close"
                size={20}
                onPress={onDismiss}
                accessibilityLabel={closeLabel}
                style={styles.closeButton}
              />
            )}
            {children}
          </Animated.View>
        </Animated.View>
      </Modal>
    </Portal>
  );
});
AnimatedDialog.displayName = 'AnimatedDialog';

const styles = StyleSheet.create({
  modal: {
    backgroundColor: 'transparent',
    ...NO_SHADOW,
  },
  content: {
    padding: 24,
    position: 'relative',
    ...NO_SHADOW,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
    ...NO_SHADOW,
  },
});
