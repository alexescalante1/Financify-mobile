import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleCard } from '@/presentation/components/card/SimpleCard';
import type { CardVariant, CardBorderStyle } from '@/presentation/components/card/cardConstants';

interface ActionCardProps {
  title: string;
  subtitle?: string;
  icon: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: CardVariant;
  borderStyle?: CardBorderStyle;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const ActionCard: React.FC<ActionCardProps> = React.memo(({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackgroundColor,
  onPress,
  disabled = false,
  variant,
  borderStyle,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const iconCircleStyle = useMemo(() => ({
    backgroundColor: iconBackgroundColor || theme.colors.primaryContainer,
  }), [iconBackgroundColor, theme.colors.primaryContainer]);

  const resolvedIconColor = iconColor || theme.colors.primary;

  const subtitleStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center' as const,
    marginTop: 2,
  }), [theme.colors.onSurfaceVariant]);

  return (
    <SimpleCard variant={variant} borderStyle={borderStyle} style={style} testID={testID} accessibilityLabel={accessibilityLabel}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.content, disabled && styles.disabled, pressed && styles.pressed]}
      >
        <View style={[styles.iconCircle, iconCircleStyle]}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={24}
            color={resolvedIconColor}
          />
        </View>
        <Text variant="bodyMedium" style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" style={subtitleStyle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </Pressable>
    </SimpleCard>
  );
});
ActionCard.displayName = 'ActionCard';

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    padding: 0,
    margin: 0,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
});
