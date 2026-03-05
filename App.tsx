import React, { useMemo } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Routes } from "@/presentation/navigation/Routes";
import { ThemeProvider, useThemeContext } from "@/presentation/theme/ThemeProvider";
import { lightTheme, darkTheme } from "@/presentation/theme/materialTheme";
import { useAppInitializer } from "@/application/core/hooks/useAppInitializer";
import { DependencyProvider } from '@/presentation/di/DependencyProvider';
import { SnackbarProvider } from '@/presentation/components/feedback/SnackbarProvider';

const AppContent = React.memo(() => {
  const { isDark } = useThemeContext();
  useAppInitializer();

  const paperTheme = useMemo(() =>
    isDark ? darkTheme : lightTheme,
    [isDark]
  );

  const navTheme = useMemo(() =>
    isDark ? DarkTheme : DefaultTheme,
    [isDark]
  );

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <SnackbarProvider>
          <Routes />
        </SnackbarProvider>
      </NavigationContainer>
    </PaperProvider>
  );
});

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DependencyProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </DependencyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
