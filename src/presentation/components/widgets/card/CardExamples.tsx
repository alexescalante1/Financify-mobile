import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { SimpleCard } from "@/presentation/components/widgets/card/SimpleCard";

export const CardExamples: React.FC = () => {
  return (
    <View>
      {/* Todas las variantes */}
      <SimpleCard>
        <Text>Hola, soy una tarjeta simple</Text>
      </SimpleCard>
      <SimpleCard variant="blue">
        <Text>Hola, soy una tarjeta simple</Text>
      </SimpleCard>
      <SimpleCard variant="green">
        <Text>Hola, soy una tarjeta simple</Text>
      </SimpleCard>
      <SimpleCard variant="purple">
        <Text>Hola, soy una tarjeta simple</Text>
      </SimpleCard>
    </View>
  );
};
