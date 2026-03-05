import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';

interface HeaderBarProps {
  title: string;
  onBack?: () => void;
  backIcon?: string;
  backLabel?: string;
  backDisabled?: boolean;
  rightAction?: React.ReactNode;
  backgroundColor?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const HeaderBar: React.FC<HeaderBarProps> = React.memo(({
  title,
  onBack,
  backIcon = 'arrow-left',
  backLabel = 'Volver',
  backDisabled = false,
  rightAction,
  backgroundColor = 'transparent',
  style,
  titleStyle,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const backButtonStyle = useMemo(() => ({
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    elevation: 2,
    opacity: backDisabled ? 0.5 : 1,
  }), [theme.colors.surface, backDisabled]);

  const titleTextStyle = useMemo(() => ({
    fontWeight: '600' as const,
    color: theme.colors.onBackground,
    flex: 1,
    textAlign: 'center' as const,
    marginRight: onBack && !rightAction ? 48 : 0,
  }), [theme.colors.onBackground, onBack, rightAction]);

  return (
    <View
      style={[styles.container, { backgroundColor }, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {onBack ? (
        <IconButton
          icon={backIcon}
          size={24}
          onPress={onBack}
          disabled={backDisabled}
          style={backButtonStyle}
          accessibilityLabel={backLabel}
        />
      ) : (
        <View style={styles.spacer} />
      )}

      <Text variant="titleLarge" style={[titleTextStyle, titleStyle]}>
        {title}
      </Text>

      {rightAction || (onBack ? <View style={styles.spacer} /> : null)}
    </View>
  );
});

HeaderBar.displayName = 'HeaderBar';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    elevation: 0,
  },
  spacer: {
    width: 48,
  },
});
