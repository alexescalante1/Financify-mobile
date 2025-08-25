import React, { useMemo, useCallback } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/MaterialIcons";
import { View } from "react-native";
import { useTheme } from "react-native-paper";

// Hooks
import { useAuth } from "../application/hooks/useAuth";
import { useNetworkConnection } from "../application/hooks/useNetworkConnection";

// Components
import AuthLoadingScreen from "@/presentation/components/screen/AuthLoadingScreen";
import NoInternetScreen from "@/presentation/components/screen/NoInternetScreen";
import ScreenWrapper from "@/presentation/components/common/wrapper/ScreenWrapper";

// Functions
import createWrappedScreen from "@/presentation/components/common/wrapper/createWrappedScreen";

// Screens - Auth
import { WelcomeScreen } from "./screens/auth/WelcomeScreen";
import { LoginScreen } from "./screens/auth/LoginScreen";
import { RegisterScreen } from "./screens/auth/RegisterScreen";

// Screens - Main
import { HomeScreen } from "./screens/home/HomeScreen";
import { TransactionListScreen } from "./screens/transaction/TransactionListScreen";
import { BudgetScreen } from "./screens/budget/BudgetScreen";
import { AssetsLiabilitiesScreen } from "./screens/assetsLiabilities/AssetsLiabilitiesScreen";
import { ProfileScreen } from "./screens/profile/ProfileScreen";

// Types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
};

export type TabParamList = {
  Home: undefined;
  Transactions: undefined;
  Budget: undefined;
  AssetsLiabilities: undefined;
  Profile: undefined;
};

// Constants
const ANIMATION_DURATION = {
  FAST: 50,
  NORMAL: 200,
} as const;

const TAB_CONFIGURATION = {
  Home: { icon: "dashboard", label: "Inicio" },
  Transactions: { icon: "swap-horiz", label: "Movimientos" },
  Budget: { icon: "pie-chart", label: "Presupuesto" },
  AssetsLiabilities: { icon: "business-center", label: "Cuentas" },
  Profile: { icon: "person", label: "Perfil" },
} as const satisfies Record<keyof TabParamList, { icon: string; label: string }>;

// Navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Components
interface TabIconProps {
  name: string;
  focused: boolean;
  primaryColor: string;
  inactiveColor: string;
}

const TabIcon = React.memo<TabIconProps>(({ name, focused, primaryColor, inactiveColor }) => (
  <Icon
    name={name}
    size={22}
    color={focused ? primaryColor : inactiveColor}
    style={{ marginBottom: -4 }}
  />
));

const WrappedWelcomeScreen = createWrappedScreen(WelcomeScreen);
const WrappedLoginScreen = createWrappedScreen(LoginScreen);
const WrappedRegisterScreen = createWrappedScreen(RegisterScreen);

const MainTabs = React.memo(() => {
  const theme = useTheme();
  
  const tabScreenOptions = useMemo(() => ({
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
  }), [theme.colors]);

  const getTabBarIcon = useCallback((routeName: keyof TabParamList) => 
    ({ focused }: { focused: boolean }) => (
      <TabIcon
        name={TAB_CONFIGURATION[routeName].icon}
        focused={focused}
        primaryColor={theme.colors.primary}
        inactiveColor={theme.colors.onSurfaceVariant}
      />
    ), [theme.colors.primary, theme.colors.onSurfaceVariant]);

  return (
    <ScreenWrapper>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: getTabBarIcon(route.name as keyof TabParamList),
          ...tabScreenOptions,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarLabel: TAB_CONFIGURATION.Home.label }}
        />
        <Tab.Screen
          name="Transactions"
          component={TransactionListScreen}
          options={{ tabBarLabel: TAB_CONFIGURATION.Transactions.label }}
        />
        <Tab.Screen
          name="Budget"
          component={BudgetScreen}
          options={{ tabBarLabel: TAB_CONFIGURATION.Budget.label }}
        />
        <Tab.Screen
          name="AssetsLiabilities"
          component={AssetsLiabilitiesScreen}
          options={{ tabBarLabel: TAB_CONFIGURATION.AssetsLiabilities.label }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ tabBarLabel: TAB_CONFIGURATION.Profile.label }}
        />
      </Tab.Navigator>
    </ScreenWrapper>
  );
});

export const Routes = React.memo(() => {
  const { user, loading, isInitialized } = useAuth();
  const { isConnected, hasRealInternetAccess, checkConnection } = useNetworkConnection();
  const theme = useTheme();

  const defaultStackScreenOptions = useMemo(() => ({
    headerShown: false,
    animation: "fade" as const,
    animationDuration: ANIMATION_DURATION.FAST,
  }), []);

  const slideScreenOptions = useMemo(() => ({
    animation: "slide_from_right" as const,
    animationDuration: ANIMATION_DURATION.NORMAL,
    gestureEnabled: true,
    gestureDirection: "horizontal" as const,
  }), []);

  const containerStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: theme.colors.background,
  }), [theme.colors.background]);

  if (!isInitialized || loading) {
    return <AuthLoadingScreen message="Iniciando aplicación..." />;
  }

  if (!isConnected || !hasRealInternetAccess) {
    return <NoInternetScreen onRetry={checkConnection} />;
  }

  return (
    <View style={containerStyle}>
      <Stack.Navigator screenOptions={defaultStackScreenOptions}>
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
              options={slideScreenOptions}
            />
            <Stack.Screen
              name="Register"
              component={WrappedRegisterScreen}
              options={slideScreenOptions}
            />
          </>
        )}
      </Stack.Navigator>
    </View>
  );
});