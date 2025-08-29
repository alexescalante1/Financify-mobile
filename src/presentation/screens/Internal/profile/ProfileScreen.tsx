import React, { useState } from "react";
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

import { SmoothPopupFullScreen } from "@/presentation/components/widgets/screen/SmoothPopupFullScreen";
import { DialogName } from "./types";

//Composites
import { WidgetsScreen } from "../../../components/composites/common/widgets/WidgetsScreen";
import { WalletManagementScreen } from "@/presentation/components/composites/Clear/wallet/WalletManagementScreen";
import CleaneHomeScreen from "@/presentation/components/composites/Clear/home/CleaneHomeScreen";

export const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const { user, logout } = useAuth();

  // DIALOG MANAGEMENT
  const [dialogState, setDialogState] = useState<Record<DialogName, boolean>>({
    playground: false,
    walletTest: false,
    homeTest: false,
  });

  const openDialog = (dialogName: DialogName) => {
    setDialogState((prevState) => ({
      ...prevState,
      [dialogName]: true,
    }));
  };

  const closeDialog = (dialogName: DialogName) => {
    setDialogState((prevState) => ({
      ...prevState,
      [dialogName]: false,
    }));
  };

  const getOpenDialog = (): DialogName | null => {
    const openEntry = Object.entries(dialogState).find(
      ([_, isOpen]) => isOpen === true
    );
    return openEntry ? (openEntry[0] as DialogName) : null;
  };

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
            <Text
              variant="headlineSmall"
              style={{ fontWeight: "600", marginBottom: 4 }}
            >
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
      <Card
        style={{ marginTop: 20, backgroundColor: theme.colors.surfaceVariant }}
      >
        <Card.Content style={{ padding: 20 }}>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "600", marginBottom: 12 }}
          >
            Información de la App
          </Text>
          <View style={{ gap: 8 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text variant="bodyMedium">Versión</Text>
              <Text variant="bodyMedium">1.0.0</Text>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text variant="bodyMedium">Última actualización</Text>
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

      {/* Sección de Composites */}
      <Card style={{ marginTop: 20, backgroundColor: theme.colors.surface }}>
        <Card.Content style={{ padding: 20 }}>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "600", marginBottom: 12 }}
          >
            Composites
          </Text>
          <View style={{ gap: 12 }}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => openDialog("playground")}
              style={{ flex: 1 }}
            >
              Widgets
            </Button>

            <Divider style={{ marginVertical: 5 }} />

            <Button
              mode="outlined"
              icon="shield-check"
              onPress={() => openDialog("walletTest")}
            >
              Wallet Test
            </Button>
            <Button
              mode="outlined"
              icon="lock"
              onPress={() => openDialog("homeTest")}
            >
              Home Test
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Modals de preview */}
      {dialogState.playground && (
        <SmoothPopupFullScreen
          visible={dialogState.playground}
          onDismiss={() => closeDialog("playground")}
          backgroundColor={theme.colors.surface}
          title="WIDGETS"
        >
          <WidgetsScreen />
        </SmoothPopupFullScreen>
      )}

      {dialogState.walletTest && (
        <SmoothPopupFullScreen
          visible={dialogState.walletTest}
          onDismiss={() => closeDialog("walletTest")}
          backgroundColor={theme.colors.surface}
          title="WALLETS TEST"
        >
          <WalletManagementScreen />
        </SmoothPopupFullScreen>
      )}

      {dialogState.homeTest && (
        <SmoothPopupFullScreen
          visible={dialogState.homeTest}
          onDismiss={() => closeDialog("homeTest")}
          backgroundColor={theme.colors.surface}
          title="HOME TEST"
        >
          <CleaneHomeScreen />
        </SmoothPopupFullScreen>
      )}
    </ScrollView>
  );
};
