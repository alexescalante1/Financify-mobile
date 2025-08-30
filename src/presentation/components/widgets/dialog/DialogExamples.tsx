import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button } from "react-native-paper";
import { AnimatedDialog } from "./AnimatedDialog";

export const DialogExamples: React.FC = () => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Button 
        mode="contained" 
        onPress={() => setVisible(true)}
      >
        Animated Dialog
      </Button>

      <AnimatedDialog
        visible={visible}
        onDismiss={() => setVisible(false)}
      >
        <Text variant="titleMedium">Hola mundo</Text>
        <Text style={{ marginTop: 16 }}>
          Este es un ejemplo simple del AnimatedDialog.
        </Text>
        <Button 
          mode="outlined" 
          onPress={() => setVisible(false)}
          style={{ marginTop: 20 }}
        >
          Cerrar
        </Button>
      </AnimatedDialog>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});