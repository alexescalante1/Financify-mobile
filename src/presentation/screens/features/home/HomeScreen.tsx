import React from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useAuth } from "@/application/auth/hooks/useAuth";

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text variant="headlineMedium" style={{ fontWeight: "bold", marginBottom: 8 }}>
        Hola, {user?.fullName || "Usuario"}
      </Text>
      <Text
        variant="bodyLarge"
        style={{ textAlign: "center", color: theme.colors.onSurfaceVariant }}
      >
        Bienvenido a Financify
      </Text>
    </View>
  );
};

export default HomeScreen;
