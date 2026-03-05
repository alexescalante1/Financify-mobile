import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from "react-native-paper";

interface ThemeContainerProps {
  children: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
}

export const ThemeContainer: React.FC<ThemeContainerProps> = React.memo(({ children, testID, accessibilityLabel }) => {
  const { colors } = useTheme();

  const containerStyle = useMemo(() => [
    styles.container,
    { backgroundColor: colors.background },
  ], [colors.background]);

  return (
    <View style={containerStyle} testID={testID} accessibilityLabel={accessibilityLabel}>
      {children}
    </View>
  );
});
ThemeContainer.displayName = 'ThemeContainer';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
