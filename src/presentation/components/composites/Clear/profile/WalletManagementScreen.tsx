import React, { useState } from "react";
import { View, ScrollView, Alert } from "react-native";
import {
  Text,
  Button,
  Card,
  Chip,
  Divider,
  useTheme,
  TextInput,
  Modal,
  Portal,
  SegmentedButtons,
  Switch,
  FAB,
  IconButton,
  ActivityIndicator,
  Snackbar,
} from "react-native-paper";

// Importar todos los hooks necesarios
import {
  useAllWallets,
  useCreateWallet,
  useUpdateWallet,
  useDeleteWallet,
  useSetPrimaryWallet,
  useUpdateBalance,
  useWalletCount,
  useTotalBalance,
} from "@/application/hooks/useWallets";
import { Wallet } from "@/domain/entities/Wallet";
import { CurrencyType } from "@/domain/types/CurrencyType";

// ========================================
// INTERFACES
// ========================================

interface WalletFormData {
  name: string;
  description: string;
  _idType: number;
  _idAssetType: number;
  balance: string;
  currency: CurrencyType;
  isPrimary: boolean;
}

interface EditWalletModalProps {
  visible: boolean;
  wallet: Wallet | null;
  onDismiss: () => void;
  onSave: (walletData: WalletFormData) => void;
  loading: boolean;
}

interface WalletCardProps {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
  onSetPrimary: (wallet: Wallet) => void;
  onUpdateBalance: (wallet: Wallet) => void;
}

// ========================================
// COMPONENTES
// ========================================

const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  onEdit,
  onDelete,
  onSetPrimary,
  onUpdateBalance,
}) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        margin: 8,
        backgroundColor: wallet.isPrimary
          ? theme.colors.primaryContainer
          : theme.colors.surface,
      }}
    >
      <Card.Content style={{ padding: 16 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text variant="titleMedium" style={{ fontWeight: "600", flex: 1 }}>
                {wallet.name}
              </Text>
              {wallet.isPrimary && (
                <Chip
                  icon="star"
                  mode="outlined"
                  textStyle={{ fontSize: 10 }}
                  style={{ marginLeft: 8 }}
                >
                  Primaria
                </Chip>
              )}
            </View>
            
            <Text variant="bodyMedium" style={{ marginBottom: 4, opacity: 0.7 }}>
              {wallet.description}
            </Text>
            
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text variant="bodySmall" style={{ marginRight: 12 }}>
                Tipo: {wallet._idType}
              </Text>
              <Chip mode="outlined" textStyle={{ fontSize: 10 }}>
                {wallet.currency}
              </Chip>
            </View>
            
            <Text
              variant="headlineSmall"
              style={{
                fontWeight: "bold",
                color: wallet.balance >= 0 ? theme.colors.primary : theme.colors.error,
              }}
            >
              {wallet.balance.toLocaleString()} {wallet.currency}
            </Text>
          </View>
          
          <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => onEdit(wallet)}
            />
            <IconButton
              icon="delete"
              size={20}
              iconColor={theme.colors.error}
              onPress={() => onDelete(wallet)}
            />
          </View>
        </View>
        
        <Divider style={{ marginVertical: 12 }} />
        
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Button
            mode="outlined"
            icon="cash"
            onPress={() => onUpdateBalance(wallet)}
            style={{ flex: 1, marginRight: 8 }}
          >
            Balance
          </Button>
          {!wallet.isPrimary && (
            <Button
              mode="contained"
              icon="star"
              onPress={() => onSetPrimary(wallet)}
              style={{ flex: 1, marginLeft: 8 }}
            >
              Primaria
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );
};

const EditWalletModal: React.FC<EditWalletModalProps> = ({
  visible,
  wallet,
  onDismiss,
  onSave,
  loading,
}) => {
  const theme = useTheme();
  const isEdit = wallet !== null;

  const [formData, setFormData] = useState<WalletFormData>({
    name: wallet?.name || "",
    description: wallet?.description || "",
    _idType: wallet?._idType || 0,
    _idAssetType: wallet?._idAssetType || 0,
    balance: wallet?.balance?.toString() || "0",
    currency: wallet?.currency || "USD",
    isPrimary: wallet?.isPrimary || false,
  });

  const [errors, setErrors] = useState<Partial<WalletFormData>>({});

  const walletTypes = [
    { value: "0", label: "Digital" },
    { value: "1", label: "Física" },
    { value: "2", label: "Banco" },
    { value: "3", label: "Crypto" },
  ];

  const currencies = [
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
    { value: "PEN", label: "PEN" },
    { value: "BTC", label: "BTC" },
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<WalletFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es requerida";
    }

    const balance = parseFloat(formData.balance);
    if (isNaN(balance)) {
      newErrors.balance = "El balance debe ser un número válido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (visible) {
      setFormData({
        name: wallet?.name || "",
        description: wallet?.description || "",
        _idType: wallet?._idType || 0,
        _idAssetType: wallet?._idAssetType || 0,
        balance: wallet?.balance?.toString() || "0",
        currency: wallet?.currency || "USD",
        isPrimary: wallet?.isPrimary || false,
      });
      setErrors({});
    }
  }, [visible, wallet]);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{
          backgroundColor: theme.colors.surface,
          margin: 20,
          padding: 20,
          borderRadius: 12,
          maxHeight: "90%",
        }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text variant="headlineSmall" style={{ marginBottom: 20, fontWeight: "600" }}>
            {isEdit ? "Editar Wallet" : "Nueva Wallet"}
          </Text>

          <TextInput
            label="Nombre *"
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            error={!!errors.name}
            style={{ marginBottom: 12 }}
          />
          {errors.name && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginBottom: 8 }}>
              {errors.name}
            </Text>
          )}

          <TextInput
            label="Descripción *"
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            error={!!errors.description}
            multiline
            numberOfLines={2}
            style={{ marginBottom: 12 }}
          />
          {errors.description && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginBottom: 8 }}>
              {errors.description}
            </Text>
          )}

          <Text variant="labelMedium" style={{ marginBottom: 8, marginTop: 8 }}>
            Tipo de Wallet
          </Text>
          <SegmentedButtons
            value={formData._idType.toString()}
            onValueChange={(value) => setFormData(prev => ({ ...prev, _idType: parseInt(value) }))}
            buttons={walletTypes}
            style={{ marginBottom: 16 }}
          />

          <TextInput
            label="Tipo de Activo"
            value={formData._idAssetType.toString()}
            onChangeText={(text) => setFormData(prev => ({ ...prev, _idAssetType: parseInt(text) || 0 }))}
            keyboardType="numeric"
            placeholder="ej: 1, 2, 3"
            style={{ marginBottom: 12 }}
          />

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            <TextInput
              label="Balance *"
              value={formData.balance}
              onChangeText={(text) => setFormData(prev => ({ ...prev, balance: text }))}
              error={!!errors.balance}
              keyboardType="numeric"
              style={{ flex: 2 }}
            />
            
            <View style={{ flex: 1 }}>
              <Text variant="labelMedium" style={{ marginBottom: 8 }}>
                Moneda
              </Text>
              <SegmentedButtons
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as CurrencyType }))}
                buttons={currencies.slice(0, 2)}
                style={{ marginBottom: 8 }}
              />
              <SegmentedButtons
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value as CurrencyType }))}
                buttons={currencies.slice(2)}
              />
            </View>
          </View>
          {errors.balance && (
            <Text style={{ color: theme.colors.error, fontSize: 12, marginBottom: 8 }}>
              {errors.balance}
            </Text>
          )}

          <View style={{ 
            flexDirection: "row", 
            justifyContent: "space-between", 
            alignItems: "center",
            marginVertical: 16 
          }}>
            <Text variant="bodyLarge">Establecer como primaria</Text>
            <Switch
              value={formData.isPrimary}
              onValueChange={(value) => setFormData(prev => ({ ...prev, isPrimary: value }))}
            />
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={{ flex: 1 }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              style={{ flex: 1 }}
              loading={loading}
              disabled={loading}
            >
              {isEdit ? "Actualizar" : "Crear"}
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

// ========================================
// COMPONENTE PRINCIPAL DE WALLETS
// ========================================

export const WalletManagementScreen: React.FC = () => {
  const theme = useTheme();

  // Hooks de datos
  const { wallets, loading: walletsLoading, error: walletsError } = useAllWallets();
  const { count: walletCount } = useWalletCount();
  const { totalBalance: usdBalance } = useTotalBalance("USD");
  const { totalBalance: eurBalance } = useTotalBalance("EUR");

  // Hooks de operaciones
  const { createWallet, loading: createLoading } = useCreateWallet();
  const { updateWallet, loading: updateLoading } = useUpdateWallet();
  const { deleteWallet, loading: deleteLoading } = useDeleteWallet();
  const { setPrimaryWallet, loading: setPrimaryLoading } = useSetPrimaryWallet();
  const { updateBalance, loading: updateBalanceLoading } = useUpdateBalance();

  // Estados del formulario
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Estados para actualizar balance
  const [balanceModalVisible, setBalanceModalVisible] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [newBalance, setNewBalance] = useState("");

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Handlers
  const handleCreateWallet = () => {
    setEditingWallet(null);
    setModalVisible(true);
  };

  const handleEditWallet = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setModalVisible(true);
  };

  const handleSaveWallet = async (formData: WalletFormData) => {
    try {
      const walletData = {
        ...formData,
        balance: parseFloat(formData.balance),
        createdAt: new Date(),
      };

      if (editingWallet) {
        // Actualizar wallet existente
        await updateWallet(editingWallet.id!, walletData);
        showSnackbar("Wallet actualizada correctamente");
      } else {
        // Crear nueva wallet
        await createWallet(walletData as Omit<Wallet, 'id' | 'createdAt'>);
        showSnackbar("Wallet creada correctamente");
      }

      setModalVisible(false);
    } catch (error) {
      console.error("Error saving wallet:", error);
      showSnackbar("Error al guardar la wallet");
    }
  };

  const handleDeleteWallet = (wallet: Wallet) => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que quieres eliminar "${wallet.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWallet(wallet.id!);
              showSnackbar("Wallet eliminada correctamente");
            } catch (error) {
              console.error("Error deleting wallet:", error);
              showSnackbar("Error al eliminar la wallet");
            }
          },
        },
      ]
    );
  };

  const handleSetPrimary = async (wallet: Wallet) => {
    try {
      await setPrimaryWallet(wallet.id!);
      showSnackbar(`"${wallet.name}" establecida como primaria`);
    } catch (error) {
      console.error("Error setting primary wallet:", error);
      showSnackbar("Error al establecer wallet primaria");
    }
  };

  const handleUpdateBalance = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    setNewBalance(wallet.balance.toString());
    setBalanceModalVisible(true);
  };

  const handleSaveBalance = async () => {
    if (!selectedWallet) return;

    try {
      const balance = parseFloat(newBalance);
      if (isNaN(balance)) {
        showSnackbar("El balance debe ser un número válido");
        return;
      }

      await updateBalance(selectedWallet.id!, balance);
      showSnackbar("Balance actualizado correctamente");
      setBalanceModalVisible(false);
    } catch (error) {
      console.error("Error updating balance:", error);
      showSnackbar("Error al actualizar el balance");
    }
  };

  const isLoading = walletsLoading || createLoading || updateLoading || deleteLoading || setPrimaryLoading || updateBalanceLoading;

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
            Gestión de Wallets
          </Text>
          <Text variant="bodyLarge" style={{ textAlign: "center" }}>
            Administra tus wallets en tiempo real
          </Text>
        </View>

        {/* Estadísticas */}
        <Card style={{ marginBottom: 20, backgroundColor: theme.colors.primaryContainer }}>
          <Card.Content style={{ padding: 20 }}>
            <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 12 }}>
              Resumen
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              <View style={{ alignItems: "center" }}>
                <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
                  {walletCount}
                </Text>
                <Text variant="bodySmall">Wallets</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
                  ${usdBalance.toLocaleString()}
                </Text>
                <Text variant="bodySmall">USD Total</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
                  €{eurBalance.toLocaleString()}
                </Text>
                <Text variant="bodySmall">EUR Total</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Estado de carga */}
        {isLoading && (
          <View style={{ alignItems: "center", marginVertical: 20 }}>
            <ActivityIndicator size="large" />
            <Text style={{ marginTop: 8 }}>Procesando...</Text>
          </View>
        )}

        {/* Error */}
        {walletsError && (
          <Card style={{ marginBottom: 20, backgroundColor: theme.colors.errorContainer }}>
            <Card.Content>
              <Text style={{ color: theme.colors.error }}>
                Error: {walletsError.message}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Lista de Wallets */}
        <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 12 }}>
          Mis Wallets ({wallets.length})
        </Text>

        {wallets.length === 0 && !walletsLoading ? (
          <Card style={{ marginBottom: 20 }}>
            <Card.Content style={{ alignItems: "center", padding: 40 }}>
              <Text variant="headlineSmall" style={{ fontSize: 48, marginBottom: 16 }}>
                📱
              </Text>
              <Text variant="titleMedium" style={{ fontWeight: "600", marginBottom: 8 }}>
                No tienes wallets
              </Text>
              <Text variant="bodyMedium" style={{ textAlign: "center", marginBottom: 20 }}>
                Crea tu primera wallet para comenzar a gestionar tus finanzas
              </Text>
              <Button mode="contained" onPress={handleCreateWallet}>
                Crear mi primera wallet
              </Button>
            </Card.Content>
          </Card>
        ) : (
          wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onEdit={handleEditWallet}
              onDelete={handleDeleteWallet}
              onSetPrimary={handleSetPrimary}
              onUpdateBalance={handleUpdateBalance}
            />
          ))
        )}
      </ScrollView>

      {/* FAB para crear wallet */}
      {wallets.length > 0 && (
        <FAB
          icon="plus"
          style={{
            position: "absolute",
            margin: 16,
            right: 0,
            bottom: 0,
          }}
          onPress={handleCreateWallet}
        />
      )}

      {/* Modal de edición */}
      <EditWalletModal
        visible={modalVisible}
        wallet={editingWallet}
        onDismiss={() => setModalVisible(false)}
        onSave={handleSaveWallet}
        loading={createLoading || updateLoading}
      />

      {/* Modal de actualizar balance */}
      <Portal>
        <Modal
          visible={balanceModalVisible}
          onDismiss={() => setBalanceModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            margin: 20,
            padding: 20,
            borderRadius: 12,
          }}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 20, fontWeight: "600" }}>
            Actualizar Balance
          </Text>
          <Text variant="bodyMedium" style={{ marginBottom: 16 }}>
            Wallet: {selectedWallet?.name}
          </Text>
          <TextInput
            label="Nuevo Balance"
            value={newBalance}
            onChangeText={setNewBalance}
            keyboardType="numeric"
            style={{ marginBottom: 20 }}
            right={<TextInput.Affix text={selectedWallet?.currency || ""} />}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button
              mode="outlined"
              onPress={() => setBalanceModalVisible(false)}
              style={{ flex: 1 }}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSaveBalance}
              style={{ flex: 1 }}
              loading={updateBalanceLoading}
            >
              Actualizar
            </Button>
          </View>
        </Modal>
      </Portal>

      {/* Snackbar */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};