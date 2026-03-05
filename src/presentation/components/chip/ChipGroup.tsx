import React, { useCallback, useMemo } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';

interface ChipOption {
  key: string;
  label: string;
  icon?: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  selected: string | string[];
  onSelect: (key: string) => void;
  multiSelect?: boolean;
  scrollable?: boolean;
  style?: ViewStyle;
  chipStyle?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = React.memo(({
  options,
  selected,
  onSelect,
  multiSelect = false,
  scrollable = true,
  style,
  chipStyle,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();

  const selectedSet = useMemo(() => {
    if (Array.isArray(selected)) return new Set(selected);
    return new Set([selected]);
  }, [selected]);

  const handleSelect = useCallback((key: string) => {
    onSelect(key);
  }, [onSelect]);

  const primaryContainerColor = theme.colors.primaryContainer;
  const onPrimaryContainerColor = theme.colors.onPrimaryContainer;
  const onSurfaceVariantColor = theme.colors.onSurfaceVariant;

  const renderChip = useCallback((option: ChipOption) => {
    const isSelected = selectedSet.has(option.key);
    return (
      <Chip
        key={option.key}
        mode={isSelected ? 'flat' : 'outlined'}
        selected={isSelected}
        onPress={() => handleSelect(option.key)}
        icon={option.icon}
        style={[
          styles.chip,
          {
            backgroundColor: isSelected
              ? primaryContainerColor
              : 'transparent',
          },
          chipStyle,
        ]}
        textStyle={{
          color: isSelected
            ? onPrimaryContainerColor
            : onSurfaceVariantColor,
        }}
        accessibilityLabel={option.label}
        accessibilityState={{ selected: isSelected }}
      >
        {option.label}
      </Chip>
    );
  }, [selectedSet, handleSelect, primaryContainerColor, onPrimaryContainerColor, onSurfaceVariantColor, chipStyle]);

  const content = options.map(renderChip);

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, style]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View
      style={[styles.wrapContent, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      {content}
    </View>
  );
});

ChipGroup.displayName = 'ChipGroup';

const styles = StyleSheet.create({
  scrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  wrapContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 0,
  },
});
