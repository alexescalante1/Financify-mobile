import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from "react-native-paper";

interface ThemeContainerProps {
  children: React.ReactNode;
}

const ThemeContainer: React.FC<ThemeContainerProps> = React.memo(({ children }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ThemeContainer;