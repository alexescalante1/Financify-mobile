import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Chip, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface FilterItem {
  key: string;
  label: string;
  icon?: string;
}

interface FilterBarProps {
  filters: FilterItem[];
  onRemove: (key: string) => void;
  onClearAll?: () => void;
  clearLabel?: string;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const FilterBar: React.FC<FilterBarProps> = React.memo(({
  filters,
  onRemove,
  onClearAll,
  clearLabel = 'Limpiar',
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const handleRemove = useCallback((key: string) => {
    onRemove(key);
  }, [onRemove]);

  const clearColor = useMemo(() => ({
    color: theme.colors.error,
  }), [theme.colors.error]);

  const chipStyle = useMemo(() => ([
    styles.chip,
    { backgroundColor: theme.colors.primaryContainer },
  ]), [theme.colors.primaryContainer]);

  const chipTextStyle = useMemo(() => ({
    color: theme.colors.onPrimaryContainer,
  }), [theme.colors.onPrimaryContainer]);

  if (filters.length === 0) return null;

  return (
    <View style={[styles.container, style]} testID={testID} accessibilityLabel={accessibilityLabel}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filters.map((filter) => (
          <Chip
            key={filter.key}
            mode="flat"
            icon={filter.icon}
            closeIcon="close-circle"
            onClose={() => handleRemove(filter.key)}
            style={chipStyle}
            textStyle={chipTextStyle}
          >
            {filter.label}
          </Chip>
        ))}
        {onClearAll && filters.length > 1 ? (
          <Pressable onPress={onClearAll} style={styles.clearButton}>
            <MaterialCommunityIcons name="filter-remove" size={16} color={theme.colors.error} />
            <Text variant="labelMedium" style={clearColor}>{clearLabel}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
});
FilterBar.displayName = 'FilterBar';

const styles = StyleSheet.create({
  container: {
    minHeight: 40,
  },
  scroll: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  chip: {
    height: 32,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
