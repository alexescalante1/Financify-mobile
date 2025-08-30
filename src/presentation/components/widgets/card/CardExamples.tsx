import React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "react-native-paper";

import { SimpleCard } from "@/presentation/components/widgets/card/SimpleCard";
import { ExpandableCard } from "@/presentation/components/widgets/card/ExpandableCard";

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

      {/* Ejemplos de ExpandableCard */}

      {/* Ejemplo 1: Tarjeta expandible básica con información */}
      <ExpandableCard
        title="Información del Usuario"
        variant="blue"
        borderStyle="elegant"
        onToggle={(expanded) => console.log("Usuario expandido:", expanded)}
      >
        <Text style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: "bold" }}>Nombre:</Text> Juan Pérez
        </Text>
        <Text style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: "bold" }}>Email:</Text> juan@ejemplo.com
        </Text>
        <Text style={{ marginBottom: 8 }}>
          <Text style={{ fontWeight: "bold" }}>Teléfono:</Text> +51 999 888 777
        </Text>
        <Text>
          <Text style={{ fontWeight: "bold" }}>Dirección:</Text> La Molina, Lima
        </Text>
      </ExpandableCard>

      {/* Ejemplo 2: FAQ con ícono a la izquierda */}
      <ExpandableCard
        title="¿Cómo funciona la aplicación?"
        variant="green"
        borderStyle="subtle"
        iconPosition="left"
        expandIcon="help-circle"
        collapseIcon="check-circle"
        initialExpanded={true}
      >
        <Text style={{ lineHeight: 22 }}>
          La aplicación te permite gestionar todas tus tareas de manera
          eficiente. Puedes crear, editar y eliminar elementos, además de
          organizarlos por categorías.
        </Text>
        <Text style={{ marginTop: 12, fontStyle: "italic", opacity: 0.8 }}>
          💡 Tip: Usa los filtros para encontrar rápidamente lo que buscas.
        </Text>
      </ExpandableCard>

      {/* Ejemplo 3: Configuraciones avanzadas */}
      <ExpandableCard
        title="Configuración Avanzada"
        variant="orange"
        borderStyle="bold"
        expandIcon="settings"
        collapseIcon="settings-outline"
        onToggle={(expanded) => {
          if (expanded) {
            console.log("Cargando configuraciones...");
          }
        }}
      >
        <View style={{ gap: 12 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB20",
            }}
          >
            <Text>Notificaciones push</Text>
            <Text style={{ color: "#22C55E" }}>✓ Activado</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: "#E5E7EB20",
            }}
          >
            <Text>Modo oscuro</Text>
            <Text style={{ color: "#6B7280" }}>✗ Desactivado</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 8,
            }}
          >
            <Text>Sincronización automática</Text>
            <Text style={{ color: "#22C55E" }}>✓ Activado</Text>
          </View>

          <Text
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginTop: 8,
              fontStyle: "italic",
            }}
          >
            Los cambios se guardan automáticamente
          </Text>
        </View>
      </ExpandableCard>
    </View>
  );
};
