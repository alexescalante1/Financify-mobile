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
import { useAuth } from "@/application/hooks/useAuth";

// ========================================
// COMPONENTE CLEAN PROFILE
// ========================================

export const CleanProfileScreen: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 24 }}>
          <Text variant="headlineMedium" style={{ fontWeight: "bold", marginBottom: 8 }}>
            Mi Perfil
          </Text>
          <Text variant="bodyLarge" style={{ textAlign: "center" }}>
            Información de tu cuenta
          </Text>
        </View>

        {/* Información del usuario */}
        <Card style={{ backgroundColor: theme.colors.surface }}>
          <Card.Content style={{ paddingVertical: 40 }}>
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <Avatar.Icon 
                size={96} 
                icon="account" 
                style={{ marginBottom: 16 }}
              />
              <Text variant="headlineSmall" style={{ fontWeight: "600", marginBottom: 4 }}>
                {user?.fullName || "Usuario"}
              </Text>
              <Text variant="bodyLarge" style={{ marginBottom: 8, opacity: 0.7 }}>
                {user?.email || "email@ejemplo.com"}
              </Text>
              {/* {user?.phone && (
                <Text variant="bodyMedium" style={{ opacity: 0.7 }}>
                  {user.phone}
                </Text>
              )} */}
            </View>
            
            <Divider style={{ marginVertical: 20 }} />
            
            {/* Información adicional */}
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text variant="bodyLarge">Estado de la cuenta</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.primary }}>
                  Activo
                </Text>
              </View>
              
              {/* {user?.createdAt && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text variant="bodyLarge">Miembro desde</Text>
                  <Text variant="bodyMedium">
                    {new Date(user.cre).toLocaleDateString()}
                  </Text>
                </View>
              )} */}
              
              {/* <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text variant="bodyLarge">Rol</Text>
                <Text variant="bodyMedium">
                  {user?.role || "Usuario"}
                </Text>
              </View> */}
            </View>

            <Divider style={{ marginVertical: 20 }} />

            {/* Acciones */}
            <View style={{ gap: 12 }}>
              <Button
                mode="outlined"
                icon="account-edit"
                style={{ marginBottom: 8 }}
                onPress={() => {
                  // Aquí puedes agregar la navegación a la pantalla de edición
                  console.log("Navegar a editar perfil");
                }}
              >
                Editar Perfil
              </Button>
              
              <Button
                mode="outlined"
                icon="cog"
                style={{ marginBottom: 8 }}
                onPress={() => {
                  // Aquí puedes agregar la navegación a configuraciones
                  console.log("Navegar a configuraciones");
                }}
              >
                Configuración
              </Button>
              
              <Button
                mode="outlined"
                icon="help-circle"
                style={{ marginBottom: 16 }}
                onPress={() => {
                  // Aquí puedes agregar la navegación a ayuda
                  console.log("Navegar a ayuda");
                }}
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
                Cerrar Sesión
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Información adicional */}
        <Card style={{ marginTop: 20, backgroundColor: theme.colors.surfaceVariant }}>
          <Card.Content style={{ padding: 20 }}>
            <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 12 }}>
              Información de la App
            </Text>
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyMedium">Versión</Text>
                <Text variant="bodyMedium">1.0.0</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyMedium">Última actualización</Text>
                <Text variant="bodyMedium">Hoy</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="bodyMedium">Plataforma</Text>
                <Text variant="bodyMedium">React Native</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Sección de privacidad */}
        <Card style={{ marginTop: 20, backgroundColor: theme.colors.surface }}>
          <Card.Content style={{ padding: 20 }}>
            <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 12 }}>
              Privacidad y Seguridad
            </Text>
            <View style={{ gap: 12 }}>
              <Button
                mode="outlined"
                icon="shield-check"
                onPress={() => {
                  console.log("Ver políticas de privacidad");
                }}
              >
                Políticas de Privacidad
              </Button>
              <Button
                mode="outlined"
                icon="lock"
                onPress={() => {
                  console.log("Cambiar contraseña");
                }}
              >
                Cambiar Contraseña
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Espacio adicional para scroll */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};