import React, { useEffect, useMemo } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from 'expo-status-bar';

import { Routes } from "@/presentation/Routes";
import { ThemeProvider, useThemeContext } from "./theme/ThemeProvider";
import { lightTheme, darkTheme } from "./theme/materialTheme";
import { AuthStorageService } from '@/infrastructure/storage/modules/AuthStorageService';

const AppContent = React.memo(() => {
  const { isDark } = useThemeContext();

  const paperTheme = useMemo(() => 
    isDark ? darkTheme : lightTheme, 
    [isDark]
  );
  
  const navTheme = useMemo(() => 
    isDark ? DarkTheme : DefaultTheme, 
    [isDark]
  );

  // const statusBarStyle = useMemo(() => 
  //   isDark ? "light" : "dark", 
  //   [isDark]
  // );
  
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        {/* <StatusBar style={statusBarStyle} /> */}
        <Routes />
      </NavigationContainer>
    </PaperProvider>
  );
});

export default function App() {
  useEffect(() => {
    const initServices = async () => {
      try {
        await AuthStorageService.init();
      } catch (error) {
        console.error('Error initializing AuthStorageService:', error);
      }
    };

    initServices();
  }, []);
  
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}