import React, { useMemo, useCallback } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useAuth } from "../../application/hooks/useAuth";
import { useNetworkConnection } from "../../application/hooks/useNetworkConnection";
import { Platform, View, ActivityIndicator } from "react-native";
import { useTheme, Text, Button, Card, Avatar } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Pantallas
import { WelcomeScreen } from "../screens/auth/WelcomeScreen";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";

import { HomeScreen } from "../screens/home/HomeScreen";
import { TransactionListScreen } from "../screens/transaction/TransactionListScreen";
import { BudgetScreen } from "../screens/budget/BudgetScreen";
import { AssetsLiabilitiesScreen } from "../screens/assetsLiabilities/AssetsLiabilitiesScreen";
import { ProfileScreen } from "../screens/profile/ProfileScreen";

// Tipos de rutas
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type TabParamList = {
  Home: undefined; // 🏠 Resumen financiero
  Transactions: undefined; // 🔄 Lista de ingresos/gastos
  Budget: undefined; // 📊 Presupuestos y control
  AssetsLiabilities: undefined; // 💼 Activos y pasivos
  Profile: undefined; // 👤 Configuración y usuario
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Configuraciones constantes
const TAB_CONFIG = {
  icons: {
    Home: "dashboard",
    Transactions: "swap-horiz",
    Budget: "pie-chart",
    AssetsLiabilities: "business-center",
    Profile: "person",
  } as Record<keyof TabParamList, string>,
  labels: {
    Home: "Inicio",
    Transactions: "Movimientos",
    Budget: "Presupuesto",
    AssetsLiabilities: "Cuentas",
    Profile: "Perfil",
  } as Record<keyof TabParamList, string>,
};

// Componente de carga
const AuthLoadingScreen: React.FC<{ message?: string }> = React.memo(
  ({ message = "Verificando sesión..." }) => {
    const theme = useTheme();

    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
          padding: 20,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={{
            color: theme.colors.onBackground,
            textAlign: "center",
            marginTop: 16,
          }}
        >
          {message}
        </Text>
      </SafeAreaView>
    );
  }
);

// Pantalla sin conexión a internet
const NoInternetScreen: React.FC<{ onRetry: () => void }> = React.memo(
  ({ onRetry }) => {
    const theme = useTheme();

    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
          padding: 20,
        }}
      >
        <Card
          mode="elevated"
          style={{
            width: "100%",
            maxWidth: 400,
            borderRadius: 16,
          }}
        >
          <Card.Content style={{ padding: 32, alignItems: "center" }}>
            <Avatar.Icon
              size={80}
              icon="wifi-off"
              style={{
                backgroundColor: theme.colors.errorContainer,
                marginBottom: 24,
              }}
            />

            <Text
              variant="headlineSmall"
              style={{
                color: theme.colors.onBackground,
                textAlign: "center",
                fontWeight: "bold",
                marginBottom: 8,
              }}
            >
              Sin conexión a internet
            </Text>

            <Text
              variant="bodyLarge"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 24,
              }}
            >
              Verifica tu conexión WiFi o datos móviles e inténtalo de nuevo
            </Text>

            <Button
              mode="contained"
              onPress={onRetry}
              icon="refresh"
              style={{ borderRadius: 10 }}
              labelStyle={{ fontSize: 15, fontWeight: "600" }}
              contentStyle={{ paddingVertical: 4 }}
            >
              Reintentar
            </Button>

            <Text
              variant="bodySmall"
              style={{
                color: theme.colors.onSurfaceVariant,
                textAlign: "center",
                marginTop: 16,
              }}
            >
              Puedes seguir usando la app con funcionalidad limitada
            </Text>
          </Card.Content>
        </Card>
      </SafeAreaView>
    );
  }
);

// Wrapper para pantallas
const ScreenWrapper: React.FC<{ children: React.ReactNode }> = React.memo(
  ({ children }) => {
    const theme = useTheme();

    return (
      <SafeAreaView
        edges={["top", "bottom", "left", "right"]}
        style={{
          flex: 1,
          // backgroundColor: theme.colors.background,
        }}
      >
        {children}
      </SafeAreaView>
    );
  }
);

// Componente de ícono de tab memoizado
const TabIcon: React.FC<{
  name: string;
  focused: boolean;
  primaryColor: string;
  inactiveColor: string;
}> = React.memo(({ name, focused, primaryColor, inactiveColor }) => (
  <Icon
    name={name}
    size={22}
    color={focused ? primaryColor : inactiveColor}
    style={{ marginBottom: -4 }}
  />
));

// Tabs principales
const MainTabs = () => {
  const theme = useTheme();

  return (
    <ScreenWrapper>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => (
            <TabIcon
              name={TAB_CONFIG.icons[route.name as keyof TabParamList]}
              focused={focused}
              primaryColor={theme.colors.primary}
              inactiveColor={theme.colors.onSurfaceVariant}
            />
          ),
          tabBarLabelStyle: {
            fontSize: 11,
            marginBottom: 4,
            fontWeight: "500" as const,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: theme.colors.surface,
            height: 60,
            borderTopWidth: 0.3,
            borderColor: theme.colors.outlineVariant || "#ccc",
            elevation: 24,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: TAB_CONFIG.labels.Home }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionListScreen}
          options={{ tabBarLabel: TAB_CONFIG.labels.Transactions }}
        />
        <Tab.Screen
          name="Budget"
          component={BudgetScreen}
          options={{ tabBarLabel: TAB_CONFIG.labels.Budget }}
        />
        <Tab.Screen
          name="AssetsLiabilities"
          component={AssetsLiabilitiesScreen}
          options={{ tabBarLabel: TAB_CONFIG.labels.AssetsLiabilities }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarLabel: TAB_CONFIG.labels.Profile }}
        />
      </Tab.Navigator>
    </ScreenWrapper>
  );
};

// Componentes wrapper para pantallas auth
const WrappedWelcomeScreen = (props: any) => (
  <ScreenWrapper>
    <WelcomeScreen {...props} />
  </ScreenWrapper>
);

const WrappedLoginScreen = (props: any) => (
  <ScreenWrapper>
    <LoginScreen {...props} />
  </ScreenWrapper>
);

const WrappedRegisterScreen = (props: any) => (
  <ScreenWrapper>
    <RegisterScreen {...props} />
  </ScreenWrapper>
);

// Navegador principal
export const AppNavigator = () => {
  const { user, loading, isInitialized } = useAuth();
  const { isConnected, hasRealInternetAccess, checkConnection } =
    useNetworkConnection();
  const theme = useTheme();

  // Memoizar opciones de navegación
  const stackScreenOptions = useMemo(
    () => ({
      headerShown: false,
      animation: "fade" as const,
      animationDuration: 50,
      contentStyle: {
        // backgroundColor: theme.colors.background,
      },
    }),
    [theme.colors.background]
  );

  const slideOptions = useMemo(
    () => ({
      animation: "slide_from_right" as const,
      animationDuration: 200,
      gestureEnabled: true,
      gestureDirection: "horizontal" as const,
    }),
    []
  );

  // Mostrar loading mientras inicializa
  if (!isInitialized || loading) {
    return <AuthLoadingScreen message="Iniciando aplicación..." />;
  }

  // Mostrar pantalla sin internet si no hay conexión
  if (!isConnected || !hasRealInternetAccess) {
    return <NoInternetScreen onRetry={checkConnection} />;
  }

  return (
    <View style={{ 
        flex: 1, 
        // backgroundColor: theme.colors.background 
      }}
    >
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {user ? (
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ animation: "none" }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Welcome"
              component={WrappedWelcomeScreen}
              options={{ animation: "none" }}
            />
            <Stack.Screen
              name="Login"
              component={WrappedLoginScreen}
              options={slideOptions}
            />
            <Stack.Screen
              name="Register"
              component={WrappedRegisterScreen}
              options={slideOptions}
            />
          </>
        )}
      </Stack.Navigator>
    </View>
  );
};

// Agregar displayNames para debugging
AuthLoadingScreen.displayName = "AuthLoadingScreen";
NoInternetScreen.displayName = "NoInternetScreen";
ScreenWrapper.displayName = "ScreenWrapper";
TabIcon.displayName = "TabIcon";
