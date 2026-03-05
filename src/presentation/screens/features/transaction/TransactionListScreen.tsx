import React from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export const TransactionListScreen: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <MaterialCommunityIcons
        name="swap-horizontal"
        size={48}
        color={theme.colors.onSurfaceVariant}
        style={{ marginBottom: 16 }}
      />
      <Text variant="titleLarge" style={{ fontWeight: "bold", marginBottom: 8 }}>
        Movimientos
      </Text>
      <Text
        variant="bodyLarge"
        style={{ textAlign: "center", color: theme.colors.onSurfaceVariant }}
      >
        Proximamente
      </Text>
    </View>
  );
};
