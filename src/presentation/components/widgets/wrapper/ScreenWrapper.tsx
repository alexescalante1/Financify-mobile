import React from "react";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

const ScreenWrapper: React.FC<{ children: React.ReactNode }> = React.memo(
  ({ children }) => {
    const theme = useTheme();

    return (
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
        }}
      >
        {children}
      </SafeAreaView>
    );
  }
);

export default ScreenWrapper;