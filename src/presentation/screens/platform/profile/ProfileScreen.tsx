import React from "react";
import { View, ScrollView } from "react-native";
import {
  Text,
  Button,
  Card,
  Divider,
  Avatar,
  useTheme,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/presentation/navigation/types";
import { useAuth } from "@/application/auth/hooks/useAuth";

export const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text
          variant="headlineMedium"
          style={{ fontWeight: "bold", marginBottom: 8 }}
        >
          Mi Perfil
        </Text>
        <Text variant="bodyLarge" style={{ textAlign: "center" }}>
          Informacion de tu cuenta
        </Text>
      </View>

      {/* Informacion del usuario */}
      <Card style={{ backgroundColor: theme.colors.surface }}>
        <Card.Content style={{ paddingVertical: 40 }}>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Avatar.Icon
              size={96}
              icon="account"
              style={{ marginBottom: 16 }}
            />
            <Text
              variant="headlineSmall"
              style={{ fontWeight: "600", marginBottom: 4 }}
            >
              {user?.fullName || "Usuario"}
            </Text>
            <Text variant="bodyLarge" style={{ marginBottom: 8, opacity: 0.7 }}>
              {user?.email || "email@ejemplo.com"}
            </Text>
          </View>

          <Divider style={{ marginVertical: 20 }} />

          {/* Acciones */}
          <View style={{ gap: 12 }}>
            <Button
              mode="outlined"
              icon="account-edit"
              style={{ marginBottom: 8 }}
              onPress={() => {}}
            >
              Editar Perfil
            </Button>

            <Button
              mode="outlined"
              icon="cog"
              style={{ marginBottom: 8 }}
              onPress={() => {}}
            >
              Configuracion
            </Button>

            <Button
              mode="outlined"
              icon="help-circle"
              style={{ marginBottom: 16 }}
              onPress={() => {}}
            >
              Ayuda y Soporte
            </Button>

            <Button
              mode="contained"
              icon="logout"
              onPress={logout}
              buttonColor={theme.colors.error}
              textColor={theme.colors.onError}
            >
              Cerrar Sesion
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Informacion adicional */}
      <Card
        style={{ marginTop: 20, backgroundColor: theme.colors.surfaceVariant }}
      >
        <Card.Content style={{ padding: 20 }}>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "600", marginBottom: 12 }}
          >
            Informacion de la App
          </Text>
          <View style={{ gap: 8 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text variant="bodyMedium">Version</Text>
              <Text variant="bodyMedium">1.0.0</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text variant="bodyMedium">Ultima actualizacion</Text>
              <Text variant="bodyMedium">Hoy</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text variant="bodyMedium">Plataforma</Text>
              <Text variant="bodyMedium">React Native</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {__DEV__ && (
        <Card
          style={{ marginTop: 20, backgroundColor: theme.colors.tertiaryContainer }}
        >
          <Card.Content style={{ padding: 20 }}>
            <Text
              variant="titleMedium"
              style={{ fontWeight: "600", marginBottom: 12 }}
            >
              Herramientas de Desarrollo
            </Text>
            <Button
              mode="contained"
              icon="palette-swatch"
              onPress={() => navigation.navigate("ComponentPreview")}
              buttonColor={theme.colors.tertiary}
              textColor={theme.colors.onTertiary}
            >
              Vista de Componentes
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};
