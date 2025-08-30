import React, { useEffect, useRef, ReactNode } from "react";
import { Animated, View } from "react-native";
import {
  Modal,
  Portal,
  IconButton,
  useTheme,
} from "react-native-paper";

interface AnimatedDialogProps {
  visible: boolean;
  onDismiss: () => void;
  dismissable?: boolean;
  showCloseButton?: boolean;
  children: ReactNode;
  maxWidth?: number;
  backgroundColor?: string;
  borderRadius?: number;
}

export const AnimatedDialog: React.FC<AnimatedDialogProps> = ({
  visible,
  onDismiss,
  dismissable = true,
  showCloseButton = true,
  children,
  maxWidth,
  backgroundColor,
  borderRadius = 12,
}) => {
  const theme = useTheme();
  
  // Valores animados
  const scaleValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      // Animación de entrada
      Animated.parallel([
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
      ]).start();
    } else {
      // Animación de salida
      Animated.parallel([
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
      ]).start();
    }
  }, [visible, scaleValue, opacityValue]);

  const containerStyle = {
    backgroundColor: 'transparent',
    margin: 20,
    borderRadius,
    // Eliminar todas las sombras
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    ...(maxWidth && { maxWidth, alignSelf: 'center' as const }),
  };

  const animatedViewStyle = {
    transform: [{ scale: scaleValue }],
    opacity: opacityValue,
    backgroundColor: backgroundColor || theme.colors.surface,
    borderRadius,
    // Eliminar todas las sombras
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        dismissable={dismissable}
        style={{ 
          backgroundColor: 'transparent',
          // Eliminar sombras del Modal
          elevation: 0,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0,
          shadowRadius: 0,
        }}
        contentContainerStyle={containerStyle}
      >
        <Animated.View style={animatedViewStyle}>
          <View style={{ 
            padding: 24, 
            position: "relative",
            // Eliminar sombras del contenedor interno
            elevation: 0,
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
          }}>
            {/* Botón de cerrar opcional */}
            {showCloseButton && (
              <IconButton
                icon="close"
                size={20}
                onPress={onDismiss}
                style={{ 
                  position: "absolute", 
                  top: 8, 
                  right: 8, 
                  zIndex: 1,
                  // Eliminar sombras del botón
                  elevation: 0,
                  shadowColor: 'transparent',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0,
                  shadowRadius: 0,
                }}
              />
            )}
            
            {/* Contenido del dialog */}
            {children}
          </View>
        </Animated.View>
      </Modal>
    </Portal>
  );
};