import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";
import { FinancifyButton } from "./FinancifyButton";

export const ButtonExamples: React.FC = () => {
  const ButtonRow = ({ children }: { children: React.ReactNode }) => (
    <View style={styles.row}>{children}</View>
  );

  return (
    <View style={styles.container}>
      {/* Todas las variantes */}
      <Text style={styles.title}>🎨 Variantes</Text>
      <ButtonRow>
        <FinancifyButton
          title="Transfer"
          variant="primary"
          icon="bank-transfer"
          style={{ flex: 1 }}
        />
      </ButtonRow>
      
      <ButtonRow>
        <FinancifyButton title="Primary" variant="primary" size="sm" />
        <FinancifyButton title="Secondary" variant="secondary" size="sm" />
        <FinancifyButton title="Tertiary" variant="tertiary" size="sm" />
      </ButtonRow>

      <ButtonRow>
        <FinancifyButton title="Success" variant="success" size="sm" />
        <FinancifyButton title="Warning" variant="warning" size="sm" />
        <FinancifyButton title="Danger" variant="danger" size="sm" />
      </ButtonRow>

      <ButtonRow>
        <FinancifyButton title="Outline" variant="outline" size="sm" />
        <FinancifyButton title="Ghost" variant="ghost" size="sm" />
      </ButtonRow>

      {/* Tamaños */}
      <Text style={styles.title}>📏 Tamaños</Text>
      <ButtonRow>
        <FinancifyButton title="Small" variant="primary" size="sm" />
        <FinancifyButton title="Medium" variant="primary" size="md" />
        <FinancifyButton title="Large" variant="primary" size="lg" />
      </ButtonRow>

      {/* Con iconos */}
      <Text style={styles.title}>🎯 Con Iconos</Text>
      <ButtonRow>
        <FinancifyButton
          title="Transfer"
          variant="primary"
          icon="bank-transfer"
          size="sm"
        />
        <FinancifyButton
          title="Payment"
          variant="success"
          icon="credit-card"
          size="sm"
        />
        <FinancifyButton
          title="Premium"
          variant="tertiary"
          icon="crown"
          iconPosition="right"
          size="sm"
        />
      </ButtonRow>

      <ButtonRow>
        <FinancifyButton
          title="Delete"
          variant="danger"
          icon="delete"
          size="sm"
        />
        <FinancifyButton
          title="Save"
          variant="outline"
          icon="bookmark"
          size="sm"
        />
        <FinancifyButton title="Share" variant="ghost" icon="share" size="sm" />
      </ButtonRow>

      {/* Casos financieros */}
      <Text style={styles.title}>💰 Casos Financieros</Text>
      <ButtonRow>
        <FinancifyButton
          title="Depositar"
          variant="success"
          icon="plus-circle"
          size="sm"
        />
        <FinancifyButton
          title="Retirar"
          variant="outline"
          icon="minus-circle"
          size="sm"
        />
        <FinancifyButton
          title="Invertir"
          variant="tertiary"
          icon="trending-up"
          size="sm"
        />
      </ButtonRow>

      {/* Estados especiales */}
      <Text style={styles.title}>⚡ Estados</Text>
      <ButtonRow>
        <FinancifyButton title="Loading" variant="primary" loading={true} />
        <FinancifyButton title="Disabled" variant="secondary" disabled={true} />
        <FinancifyButton title="Compact" variant="tertiary" compact={true} />
      </ButtonRow>

      <ButtonRow>
        <FinancifyButton title="UPPERCASE" variant="warning" uppercase={true} />
        <FinancifyButton
          title="Full Width"
          variant="primary"
          style={{ flex: 1 }}
        />
      </ButtonRow>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 8,
  },
});
