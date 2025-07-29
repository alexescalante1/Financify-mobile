import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

export const BudgetScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text variant="headlineMedium">Presupuesto</Text>
    <Text variant="bodyLarge">Seguimiento de tus límites de gasto.</Text>
  </View>
);
