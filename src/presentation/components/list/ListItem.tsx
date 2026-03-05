import React, { useMemo, useCallback } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SkeletonLoader } from '@/presentation/components/skeleton/SkeletonLoader';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  leftIconColor?: string;
  leftIconBackgroundColor?: string;
  rightValue?: string;
  rightValueColor?: string;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const ListItem: React.FC<ListItemProps> = React.memo(({
  title,
  subtitle,
  leftIcon,
  leftIconColor,
  leftIconBackgroundColor,
  rightValue,
  rightValueColor,
  showChevron = false,
  onPress,
  disabled = false,
  loading = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const iconBg = leftIconBackgroundColor || theme.colors.primaryContainer;
  const iconColor = leftIconColor || theme.colors.onPrimaryContainer;
  const valueColor = rightValueColor || theme.colors.onSurface;

  const subtitleStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
    marginTop: 4,
  }), [theme.colors.onSurfaceVariant]);

  const handlePress = useCallback(() => {
    if (!disabled) onPress?.();
  }, [onPress, disabled]);

  if (loading) {
    return (
      <View
        style={[styles.container, style]}
        testID={testID}
        accessibilityLabel={accessibilityLabel || 'Cargando elemento'}
      >
        {leftIcon !== undefined ? (
          <SkeletonLoader variant="avatar" width={40} height={40} borderRadius={20} style={styles.iconSkeleton} />
        ) : null}
        <View style={styles.textContainer}>
          <SkeletonLoader width={140} height={16} borderRadius={4} />
          {subtitle !== undefined ? (
            <SkeletonLoader width={100} height={12} borderRadius={4} style={styles.subtitleSkeleton} />
          ) : null}
        </View>
        {rightValue !== undefined ? (
          <SkeletonLoader width={60} height={14} borderRadius={4} />
        ) : null}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress ? handlePress : undefined}
      disabled={disabled || !onPress}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed && !disabled ? 0.7 : disabled ? 0.5 : 1 },
        style,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityRole={onPress ? 'button' : 'text'}
    >
      {leftIcon ? (
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <MaterialCommunityIcons
            name={leftIcon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={20}
            color={iconColor}
          />
        </View>
      ) : null}

      <View style={styles.textContainer}>
        <Text variant="bodyLarge" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" style={subtitleStyle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightValue ? (
        <Text
          variant="bodyMedium"
          style={[styles.rightValue, { color: valueColor }]}
          numberOfLines={1}
        >
          {rightValue}
        </Text>
      ) : null}

      {showChevron ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={theme.colors.onSurfaceVariant}
          style={styles.chevron}
        />
      ) : null}
    </Pressable>
  );
});

ListItem.displayName = 'ListItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconSkeleton: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitleSkeleton: {
    marginTop: 4,
  },
  rightValue: {
    marginLeft: 8,
    fontWeight: '500',
  },
  chevron: {
    marginLeft: 8,
  },
});
