import React, { useMemo } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SimpleCard } from '@/presentation/components/card/SimpleCard';
import type { CardVariant, CardBorderStyle } from '@/presentation/components/card/cardConstants';

interface CompactCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  iconBackgroundColor?: string;
  rightValue?: string;
  rightValueColor?: string;
  rightAction?: React.ReactNode;
  onPress?: () => void;
  variant?: CardVariant;
  borderStyle?: CardBorderStyle;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const CompactCard: React.FC<CompactCardProps> = React.memo(({
  title,
  subtitle,
  icon,
  iconColor,
  iconBackgroundColor,
  rightValue,
  rightValueColor,
  rightAction,
  onPress,
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

  const resolvedIconColor = iconColor || theme.colors.onPrimaryContainer;

  const rightValueStyle = useMemo(() => ({
    color: rightValueColor || theme.colors.onSurfaceVariant,
  }), [rightValueColor, theme.colors.onSurfaceVariant]);

  const subtitleStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  const content = (
    <View style={styles.row}>
      {icon ? (
        <View style={[styles.iconCircle, iconCircleStyle]}>
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={18}
            color={resolvedIconColor}
          />
        </View>
      ) : null}
      <View style={styles.textColumn}>
        <Text variant="bodyMedium" style={styles.title} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text variant="bodySmall" style={subtitleStyle} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
      {rightValue ? (
        <Text variant="bodyMedium" style={rightValueStyle}>{rightValue}</Text>
      ) : null}
      {rightAction || null}
    </View>
  );

  return (
    <SimpleCard variant={variant} borderStyle={borderStyle} style={style} testID={testID} accessibilityLabel={accessibilityLabel}>
      {onPress ? (
        <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
          {content}
        </Pressable>
      ) : content}
    </SimpleCard>
  );
});
CompactCard.displayName = 'CompactCard';

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.7,
  },
});
