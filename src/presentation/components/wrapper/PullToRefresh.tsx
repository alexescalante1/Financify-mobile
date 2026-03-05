import React, { useCallback, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

interface PullToRefreshProps {
  refreshing: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  scrollEnabled?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = React.memo(({
  refreshing,
  onRefresh,
  children,
  scrollEnabled = true,
  style,
  contentContainerStyle,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const refreshControl = useMemo(() => (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[theme.colors.primary]}
      tintColor={theme.colors.primary}
      progressBackgroundColor={theme.colors.surface}
    />
  ), [refreshing, onRefresh, theme.colors.primary, theme.colors.surface]);

  return (
    <ScrollView
      refreshControl={refreshControl}
      scrollEnabled={scrollEnabled}
      style={[styles.container, style]}
      contentContainerStyle={contentContainerStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </ScrollView>
  );
});

PullToRefresh.displayName = 'PullToRefresh';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
