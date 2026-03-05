import React, { useRef, useCallback, useMemo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle, Animated } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface SwipeAction {
  icon: string;
  label?: string;
  color: string;
  onPress: () => void;
}

interface SwipeableRowProps {
  children: React.ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  actionWidth?: number;
  actionTextColor?: string;
  overshootLeft?: boolean;
  overshootRight?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const SwipeableRow: React.FC<SwipeableRowProps> = React.memo(({
  children,
  leftActions,
  rightActions,
  actionWidth = 80,
  actionTextColor,
  overshootLeft = false,
  overshootRight = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const swipeableRef = useRef<Swipeable>(null);
  const resolvedTextColor = actionTextColor || theme.colors.surface;

  const closeSwipeable = useCallback(() => {
    swipeableRef.current?.close();
  }, []);

  const renderActions = useCallback((
    actions: SwipeAction[],
    progressAnimatedValue: Animated.AnimatedInterpolation<number>,
    side: 'left' | 'right',
  ) => {
    const totalWidth = actions.length * actionWidth;
    // Cache interpolation once per render call, not per action
    const opacity = progressAnimatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <View style={[styles.actionsContainer, { width: totalWidth }]}>
        {actions.map((action, index) => (
            <Animated.View
              key={`${side}-${index}`}
              style={[styles.actionItem, { width: actionWidth, opacity }]}
            >
              <Pressable
                onPress={() => {
                  action.onPress();
                  closeSwipeable();
                }}
                style={[styles.actionButton, { backgroundColor: action.color }]}
                accessibilityLabel={action.label || action.icon}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={action.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={22}
                  color={resolvedTextColor}
                />
                {action.label ? (
                  <Text variant="labelSmall" style={[styles.actionLabel, { color: resolvedTextColor }]}>
                    {action.label}
                  </Text>
                ) : null}
              </Pressable>
            </Animated.View>
          ))}
      </View>
    );
  }, [actionWidth, closeSwipeable, resolvedTextColor]);

  const renderLeftActions = useCallback(
    (progress: Animated.AnimatedInterpolation<number>) => {
      if (!leftActions?.length) return null;
      return renderActions(leftActions, progress, 'left');
    },
    [leftActions, renderActions],
  );

  const renderRightActions = useCallback(
    (progress: Animated.AnimatedInterpolation<number>) => {
      if (!rightActions?.length) return null;
      return renderActions(rightActions, progress, 'right');
    },
    [rightActions, renderActions],
  );

  return (
    <View testID={testID} accessibilityLabel={accessibilityLabel}>
      <Swipeable
        ref={swipeableRef}
        renderLeftActions={leftActions?.length ? renderLeftActions : undefined}
        renderRightActions={rightActions?.length ? renderRightActions : undefined}
        overshootLeft={overshootLeft}
        overshootRight={overshootRight}
        containerStyle={style}
      >
        {children}
      </Swipeable>
    </View>
  );
});

SwipeableRow.displayName = 'SwipeableRow';

const styles = StyleSheet.create({
  actionsContainer: {
    flexDirection: 'row',
  },
  actionItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  actionLabel: {
    marginTop: 4,
    fontWeight: '600',
  },
});
