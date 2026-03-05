import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface ScreenWrapperProps {
  children: React.ReactNode;
  testID?: string;
  accessibilityLabel?: string;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = React.memo(
  ({ children, testID, accessibilityLabel }) => {
    const theme = useTheme();

    const containerStyle = useMemo(() => [
      styles.container,
      { backgroundColor: theme.colors.background },
    ], [theme.colors.background]);

    return (
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={containerStyle}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      >
        {children}
      </SafeAreaView>
    );
  }
);
ScreenWrapper.displayName = 'ScreenWrapper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
