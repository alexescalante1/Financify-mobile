import React, { useEffect, useRef, useState, useCallback, useMemo, ReactNode } from 'react';
import { Animated, ScrollView, View, StyleSheet, useWindowDimensions } from 'react-native';
import { Portal, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeaderBar } from '@/presentation/components/navigation/HeaderBar';

interface FullScreenModalProps {
  visible: boolean;
  onDismiss: () => void;
  title?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  backgroundColor?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export const FullScreenModal: React.FC<FullScreenModalProps> = React.memo(({
  visible,
  onDismiss,
  title = '',
  headerRight,
  footer,
  children,
  backgroundColor,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const { height: screenHeight } = useWindowDimensions();
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const [shouldRender, setShouldRender] = useState(false);
  const shouldRenderRef = useRef(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const screenHeightRef = useRef(screenHeight);
  screenHeightRef.current = screenHeight;

  const cleanup = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    const h = screenHeightRef.current;
    let rafId: number | null = null;
    if (visible) {
      cleanup();
      translateY.setValue(h);
      shouldRenderRef.current = true;
      setShouldRender(true);
      rafId = requestAnimationFrame(() => {
        animationRef.current = Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        });
        animationRef.current.start();
      });
    } else if (shouldRenderRef.current) {
      cleanup();
      animationRef.current = Animated.timing(translateY, {
        toValue: h,
        duration: 250,
        useNativeDriver: true,
      });
      animationRef.current.start(() => {
        shouldRenderRef.current = false;
        setShouldRender(false);
        translateY.setValue(h);
      });
    }
    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      cleanup();
    };
  }, [visible, cleanup, translateY]);

  const bgColor = backgroundColor || theme.colors.surface;

  const containerStyle = useMemo(() => ({
    backgroundColor: bgColor,
  }), [bgColor]);

  const footerStyle = useMemo(() => ({
    borderTopColor: theme.colors.outlineVariant,
    backgroundColor: bgColor,
  }), [theme.colors.outlineVariant, bgColor]);

  if (!shouldRender) return null;

  return (
    <Portal>
      <Animated.View
        style={[styles.overlay, containerStyle, { transform: [{ translateY }] }]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      >
        <SafeAreaView style={styles.safeArea}>
          <HeaderBar
            title={title}
            onBack={onDismiss}
            backIcon="close"
            backLabel="Cerrar"
            rightAction={headerRight}
          />
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          {footer ? (
            <View style={[styles.footer, footerStyle]}>
              {footer}
            </View>
          ) : null}
        </SafeAreaView>
      </Animated.View>
    </Portal>
  );
});
FullScreenModal.displayName = 'FullScreenModal';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 10,
  },
  safeArea: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 32,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
