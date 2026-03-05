import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, ViewStyle } from 'react-native';

interface KeyboardAvoidingWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardVerticalOffset?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const KeyboardAvoidingWrapper: React.FC<KeyboardAvoidingWrapperProps> = React.memo(({
  children,
  scrollable = true,
  keyboardVerticalOffset = 0,
  style,
  contentContainerStyle,
  testID,
  accessibilityLabel,
}) => {
  const behavior = Platform.OS === 'ios' ? 'padding' as const : 'height' as const;

  return (
    <KeyboardAvoidingView
      behavior={behavior}
      keyboardVerticalOffset={keyboardVerticalOffset}
      style={[styles.container, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {scrollable ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        >
          {children}
        </ScrollView>
      ) : children}
    </KeyboardAvoidingView>
  );
});

KeyboardAvoidingWrapper.displayName = 'KeyboardAvoidingWrapper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
