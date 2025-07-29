import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export const TransactionListScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text variant="headlineMedium">Movimientos</Text>
    <Text variant="bodyLarge">Lista de ingresos y gastos.</Text>
  </View>
);
