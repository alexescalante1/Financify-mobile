import React, { useEffect, useRef, useState, ReactNode, useCallback, useMemo } from 'react';
import { Animated, View, AppState, ViewStyle, useWindowDimensions, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotation: Animated.Value;
  duration: number;
  size: number;
  typeIndex: number;
  isAnimating: boolean;
}

export interface ParticleShape {
  render: (size: number, color: string) => ReactNode;
}

interface OptimizedParticlesBackgroundProps {
  particleCount?: number;
  children?: React.ReactNode;
  enabled?: boolean;
  particleColor?: string;
  particleShapes?: ParticleShape[];
  style?: ViewStyle;
  testID?: string;
}

const DEFAULT_DOT_SHAPE: ParticleShape = {
  render: (size, color) => (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}
    />
  ),
};

export const OptimizedParticlesBackground: React.FC<OptimizedParticlesBackgroundProps> = React.memo(({
  particleCount = 6,
  children,
  enabled = true,
  particleColor,
  particleShapes,
  style,
  testID,
}) => {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const particles = useRef<Particle[]>([]);
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const appState = useRef(AppState.currentState);

  // Use refs to avoid stale closures in animation callbacks
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const isScreenFocusedRef = useRef(true);
  const dimensionsRef = useRef({ width, height });
  dimensionsRef.current = { width, height };

  const resolvedColor = particleColor || theme.colors.primary;
  const shapes = particleShapes && particleShapes.length > 0
    ? particleShapes
    : [DEFAULT_DOT_SHAPE];
  const shapesRef = useRef(shapes);
  shapesRef.current = shapes;

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  }, []);

  const pauseAnimations = useCallback(() => {
    animationsRef.current.forEach(a => a.stop());
    animationsRef.current = [];
    clearTimeouts();
    particles.current.forEach(p => { p.isAnimating = false; });
  }, [clearTimeouts]);

  const cleanupAnimations = useCallback(() => {
    pauseAnimations();
    particles.current = [];
  }, [pauseAnimations]);

  const animateParticle = useCallback((particle: Particle) => {
    if (!particle || !enabledRef.current || !isScreenFocusedRef.current || particle.isAnimating) return;

    particle.isAnimating = true;
    const { width: w, height: h } = dimensionsRef.current;

    const margin = 30;
    const newX = Math.random() * (w - margin * 2) + margin;
    const newY = Math.random() * (h - margin * 2) + margin;
    const newOpacity = Math.random() * 0.4 + 0.3;
    const newScale = Math.random() * 0.3 + 0.7;

    const animation = Animated.parallel([
      Animated.timing(particle.x, {
        toValue: newX,
        duration: particle.duration,
        useNativeDriver: true,
      }),
      Animated.timing(particle.y, {
        toValue: newY,
        duration: particle.duration,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(particle.opacity, {
          toValue: newOpacity,
          duration: particle.duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(particle.opacity, {
          toValue: Math.random() * 0.3 + 0.2,
          duration: particle.duration / 2,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(particle.scale, {
        toValue: newScale,
        duration: particle.duration,
        useNativeDriver: true,
      }),
      Animated.timing(particle.rotation, {
        toValue: 1,
        duration: particle.duration,
        useNativeDriver: true,
      }),
    ]);

    animationsRef.current.push(animation);

    animation.start(({ finished }) => {
      particle.isAnimating = false;
      // Remove completed animation from tracking array
      animationsRef.current = animationsRef.current.filter(a => a !== animation);

      if (finished && enabledRef.current && isScreenFocusedRef.current) {
        particle.rotation.setValue(0);
        addTimeout(() => {
          animateParticle(particle);
        }, Math.random() * 2000 + 1000);
      }
    });
  }, [addTimeout]);

  const startAnimations = useCallback(() => {
    if (!enabledRef.current || !isScreenFocusedRef.current) return;

    particles.current.forEach((particle, index) => {
      if (!particle.isAnimating) {
        addTimeout(() => {
          animateParticle(particle);
        }, index * 300);
      }
    });
  }, [animateParticle, addTimeout]);

  const restartAnimations = useCallback(() => {
    pauseAnimations();
    addTimeout(() => {
      startAnimations();
    }, 500);
  }, [pauseAnimations, startAnimations, addTimeout]);

  const initializeParticles = useCallback(() => {
    cleanupAnimations();
    const { width: w, height: h } = dimensionsRef.current;

    particles.current = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: new Animated.Value(Math.random() * (w - 50) + 25),
      y: new Animated.Value(Math.random() * (h - 100) + 50),
      opacity: new Animated.Value(Math.random() * 0.5 + 0.3),
      scale: new Animated.Value(Math.random() * 0.4 + 0.6),
      rotation: new Animated.Value(0),
      duration: Math.random() * 20000 + 15000,
      typeIndex: Math.floor(Math.random() * shapesRef.current.length),
      size: Math.random() * 8 + 12,
      isAnimating: false,
    }));

    setIsInitialized(true);

    addTimeout(() => {
      if (enabledRef.current && isScreenFocusedRef.current) {
        startAnimations();
      }
    }, 1000);
  }, [particleCount, cleanupAnimations, startAnimations, addTimeout]);

  useFocusEffect(
    useCallback(() => {
      isScreenFocusedRef.current = true;
      if (enabledRef.current && isInitialized) {
        addTimeout(() => {
          restartAnimations();
        }, 300);
      }

      return () => {
        isScreenFocusedRef.current = false;
        pauseAnimations();
      };
    }, [isInitialized, restartAnimations, pauseAnimations, addTimeout])
  );

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        if (enabledRef.current && isScreenFocusedRef.current) {
          addTimeout(() => {
            restartAnimations();
          }, 500);
        }
      } else if (nextAppState.match(/inactive|background/)) {
        pauseAnimations();
      }
      appState.current = nextAppState as typeof appState.current;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [restartAnimations, pauseAnimations, addTimeout]);

  useEffect(() => {
    return () => {
      cleanupAnimations();
    };
  }, [cleanupAnimations]);

  useEffect(() => {
    if (!enabled) {
      cleanupAnimations();
      setIsInitialized(false);
      return;
    }

    initializeParticles();
  }, [enabled, particleCount, width, height, cleanupAnimations, initializeParticles]);

  const renderParticleContent = useCallback((particle: Particle) => {
    const shape = shapesRef.current[particle.typeIndex % shapesRef.current.length];
    return shape.render(particle.size, resolvedColor);
  }, [resolvedColor]);

  const renderParticle = useCallback((particle: Particle) => (
    <Animated.View
      key={particle.id}
      style={[
        styles.particle,
        {
          opacity: particle.opacity,
          transform: [
            { translateX: particle.x },
            { translateY: particle.y },
            { scale: particle.scale },
            {
              rotate: particle.rotation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        },
      ]}
    >
      {renderParticleContent(particle)}
    </Animated.View>
  ), [renderParticleContent]);

  const bgStyle = useMemo(() => ({
    flex: 1 as const,
    backgroundColor: theme.colors.background,
  }), [theme.colors.background]);

  if (!enabled || !isInitialized) {
    return (
      <View style={[bgStyle, style]} testID={testID}>
        {children}
      </View>
    );
  }

  return (
    <View style={[bgStyle, style]} testID={testID}>
      <View style={styles.particleLayer} pointerEvents="none">
        {particles.current.map(renderParticle)}
      </View>
      {children}
    </View>
  );
});
OptimizedParticlesBackground.displayName = 'OptimizedParticlesBackground';

const styles = StyleSheet.create({
  dot: {
    opacity: 0.6,
  },
  particle: {
    position: 'absolute',
  },
  particleLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
