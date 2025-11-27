import React, { useMemo, useCallback } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// Hooks
import { useAuth } from "../application/hooks/useAuth";
import { useNetworkConnection } from "../application/hooks/useNetworkConnection";

// Components
import ThemeContainer from "@/presentation/components/widgets/container/ThemeContainer";
import ScreenWrapper from "@/presentation/components/widgets/wrapper/ScreenWrapper";
import LoadingScreen from "@/presentation/components/composites/internal/LoadingScreen";
import NoInternetScreen from "@/presentation/components/composites/internal/NoInternetScreen";

// Functions
import CreateWrappedScreen from "@/presentation/components/widgets/wrapper/CreateWrappedScreen";

// Screens - Auth
import { WelcomeScreen } from "./screens/Internal/auth/WelcomeScreen";
import { LoginScreen } from "./screens/Internal/auth/LoginScreen";
import { RegisterScreen } from "./screens/Internal/auth/RegisterScreen";

// Screens - Main
import { HomeScreen } from "./screens/Pages/home/HomeScreen";
import { TransactionListScreen } from "./screens/Pages/transaction/TransactionListScreen";
import { BudgetScreen } from "./screens/Pages/budget/BudgetScreen";
import { BeadingScreen } from "./screens/Pages/beading/BeadingScreen";
import { ProfileScreen } from "./screens/Internal/profile/ProfileScreen";

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
  Home: { icon: "view-dashboard", label: "Inicio" },
  Transactions: { icon: "swap-horizontal", label: "Movimientos" },
  Budget: { icon: "chart-pie", label: "Presupuesto" },
  AssetsLiabilities: { icon: "briefcase", label: "Cuentas" },
  Profile: { icon: "account", label: "Perfil" },
} as const;

// Navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Components
interface TabIconProps {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  size: number;
}

const TabIcon = React.memo<TabIconProps>(({ name, color, size }) => (
  <MaterialCommunityIcons name={name} size={size} color={color} />
));

const WrappedWelcomeScreen = CreateWrappedScreen(WelcomeScreen);
const WrappedLoginScreen = CreateWrappedScreen(LoginScreen);
const WrappedRegisterScreen = CreateWrappedScreen(RegisterScreen);

const MainTabs = React.memo(() => {
  const theme = useTheme();

  const tabScreenOptions = useMemo(
    () => ({
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
    }),
    [theme.colors]
  );

  const getTabBarIcon = useCallback(
    (routeName: keyof TabParamList) =>
      ({ color }: { color: string }) => (
        <TabIcon
          name={TAB_CONFIGURATION[routeName].icon as keyof typeof MaterialCommunityIcons.glyphMap}
          color={color}
          size={24}
        />
      ),
    []
  );

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
          options={{ tabBarLabel: TAB_CONFIGURATION.Home.label }}
        >
          {() => (
            <ThemeContainer>
              <HomeScreen />
            </ThemeContainer>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Transactions"
          options={{ tabBarLabel: TAB_CONFIGURATION.Transactions.label }}
        >
          {() => (
            <ThemeContainer>
              <TransactionListScreen />
            </ThemeContainer>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Budget"
          options={{ tabBarLabel: TAB_CONFIGURATION.Budget.label }}
        >
          {() => (
            <ThemeContainer>
              <BudgetScreen />
            </ThemeContainer>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="AssetsLiabilities"
          options={{ tabBarLabel: TAB_CONFIGURATION.AssetsLiabilities.label }}
        >
          {() => (
            <ThemeContainer>
              <BeadingScreen />
            </ThemeContainer>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Profile"
          options={{ tabBarLabel: TAB_CONFIGURATION.Profile.label }}
        >
          {() => (
            <ThemeContainer>
              <ProfileScreen />
            </ThemeContainer>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </ScreenWrapper>
  );
});

export const Routes = React.memo(() => {
  const { user, loading, isInitialized } = useAuth();
  const { isConnected, hasRealInternetAccess, checkConnection } =
    useNetworkConnection();
  const theme = useTheme();

  const defaultStackScreenOptions = useMemo(
    () => ({
      headerShown: false,
      animation: "fade" as const,
      animationDuration: ANIMATION_DURATION.FAST,
    }),
    []
  );

  const slideScreenOptions = useMemo(
    () => ({
      animation: "slide_from_right" as const,
      animationDuration: ANIMATION_DURATION.NORMAL,
      gestureEnabled: true,
      gestureDirection: "horizontal" as const,
    }),
    []
  );

  const containerStyle = useMemo(
    () => ({
      flex: 1,
      backgroundColor: theme.colors.background,
    }),
    [theme.colors.background]
  );

  if (!isInitialized || loading) {
    return <LoadingScreen message="Iniciando aplicación..." />;
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