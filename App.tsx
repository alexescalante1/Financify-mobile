import React, { useEffect, useMemo } from "react";
import { Provider as PaperProvider } from "react-native-paper";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { AppNavigator } from "@/presentation/navigation/AppNavigator";
import { ThemeProvider, useThemeContext } from "./theme/ThemeProvider";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { lightTheme, darkTheme } from "./theme/materialTheme";
import { StatusBar } from 'expo-status-bar';

import { AuthStorageService } from '@/infrastructure/storage/modules/AuthStorageService';

// Componente interno que usa el contexto
const AppContent: React.FC = React.memo(() => {
  const { isDark } = useThemeContext();

  // Memoizar los temas para evitar recreaciones innecesarias
  const paperTheme = useMemo(() => 
    isDark ? darkTheme : lightTheme, 
    [isDark]
  );
  
  const navTheme = useMemo(() => 
    isDark ? DarkTheme : DefaultTheme, 
    [isDark]
  );

  // Memoizar el style del StatusBar
  const statusBarStyle = useMemo(() => 
    isDark ? "light" : "dark", 
    [isDark]
  );

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={statusBarStyle} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
});

AppContent.displayName = 'AppContent';

// Componente principal
export default function App() {
  useEffect(() => {
    // Inicializar servicios de forma asíncrona si es posible
    const initServices = async () => {
      try {
        await AuthStorageService.init();
      } catch (error) {
        console.error('Error initializing AuthStorageService:', error);
        // Aquí podrías manejar el error o mostrar una pantalla de error
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