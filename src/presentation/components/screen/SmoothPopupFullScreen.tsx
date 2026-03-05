import React, { useEffect, useRef, ReactNode, useState, useCallback, useMemo } from "react";
import { Animated, View, StyleSheet } from "react-native";
import {
  Portal,
  IconButton,
  useTheme,
  Text,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const staticStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 10,
  },
  animatedContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 56,
  },
  spacer: {
    width: 48,
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontWeight: '600',
    includeFontPadding: false,
  },
  iconButton: {
    margin: 0,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flex: 1,
  },
});

interface SmoothPopupFullScreenProps {
  visible: boolean;
  onDismiss: () => void;
  children: ReactNode;
  backgroundColor?: string;
  title?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export const SmoothPopupFullScreen: React.FC<SmoothPopupFullScreenProps> = React.memo(({
  visible,
  onDismiss,
  children,
  backgroundColor,
  title,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  
  // Valor animado para escala - más elegante que translateY
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  
  // Estado para controlar cuándo desmontar el componente
  const [shouldRender, setShouldRender] = useState(false);

  // Una sola referencia para animación
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const fallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isClosingRef = useRef(false);

  // Función para limpiar animación
  const cleanupAnimation = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
  }, []);

  // Función para forzar cierre inmediato
  const forceClose = useCallback(() => {
    cleanupAnimation();
    setShouldRender(false);
    isClosingRef.current = false;
    scale.setValue(0.85);
    opacity.setValue(0);
  }, [cleanupAnimation, scale, opacity]);

  useEffect(() => {
    if (visible && !isClosingRef.current) {
      cleanupAnimation();
      setShouldRender(true);
      isClosingRef.current = false;

      requestAnimationFrame(() => {
        animationRef.current = Animated.parallel([
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 6,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 240,
            useNativeDriver: true,
          }),
        ]);

        animationRef.current.start();
      });
    } else if (!visible && shouldRender) {
      isClosingRef.current = true;
      cleanupAnimation();

      animationRef.current = Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),
      ]);

      animationRef.current.start(() => {
        forceClose();
      });

      // Fallback de seguridad con ref para evitar stale closure
      fallbackTimerRef.current = setTimeout(() => {
        if (isClosingRef.current) {
          forceClose();
        }
      }, 200);
    }

    return cleanupAnimation;
  }, [visible, shouldRender, forceClose, cleanupAnimation, scale, opacity]);

  // Callback memoizado con cierre inmediato
  const handleDismiss = useCallback(() => {
    // Forzar cierre inmediato si ya está cerrando
    if (isClosingRef.current) {
      forceClose();
      onDismiss();
      return;
    }

    onDismiss();
  }, [onDismiss, forceClose]);

  const bgColor = backgroundColor || theme.colors.surface;

  const containerStyle = useMemo(() => ({
    ...staticStyles.container,
    backgroundColor: bgColor,
  }), [bgColor]);

  const headerStyle = useMemo(() => ({
    ...staticStyles.header,
    backgroundColor: bgColor,
  }), [bgColor]);

  const titleStyle = useMemo(() => ({
    ...staticStyles.title,
    color: theme.colors.onSurface,
  }), [theme.colors.onSurface]);

  if (!shouldRender) return null;

  return (
    <Portal>
      <Animated.View
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        style={[
          containerStyle,
          { opacity }
        ]}
      >        
        <Animated.View
          style={[
            staticStyles.animatedContainer,
            {
              transform: [{ scale }],
            }
          ]}
        >
          <SafeAreaView style={staticStyles.safeArea}>
            <View style={headerStyle}>
              <View style={staticStyles.spacer} />
              
              <View style={staticStyles.titleContainer}>
                {title && (
                  <Text variant="headlineSmall" style={titleStyle}>
                    {title}
                  </Text>
                )}
              </View>
              
              <IconButton
                icon="close"
                size={24}
                onPress={handleDismiss}
                style={staticStyles.iconButton}
                accessibilityLabel="Cerrar"
              />
            </View>
            
            <View style={staticStyles.content}>
              {children}
            </View>
          </SafeAreaView>
        </Animated.View>
      </Animated.View>
    </Portal>
  );
});
SmoothPopupFullScreen.displayName = 'SmoothPopupFullScreen';