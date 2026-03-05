import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, Pressable, StyleSheet } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnimatedDialog } from '@/presentation/components/dialog/AnimatedDialog';

interface SelectionOption {
  key: string;
  label: string;
  icon?: string;
  description?: string;
}

interface SelectionDialogProps {
  visible: boolean;
  onDismiss: () => void;
  title: string;
  options: SelectionOption[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  showCheck?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  maxHeight?: number;
  testID?: string;
  accessibilityLabel?: string;
}

export const SelectionDialog: React.FC<SelectionDialogProps> = React.memo(({
  visible,
  onDismiss,
  title,
  options,
  selectedKey,
  onSelect,
  showCheck = true,
  searchable = false,
  searchPlaceholder = 'Buscar...',
  maxHeight = 300,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelect = useCallback((key: string) => {
    onSelect(key);
    onDismiss();
    setSearchQuery('');
  }, [onSelect, onDismiss]);

  const handleDismiss = useCallback(() => {
    setSearchQuery('');
    onDismiss();
  }, [onDismiss]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase().trim();
    return options.filter(opt =>
      opt.label.toLowerCase().includes(query) ||
      opt.description?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const descriptionStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  const selectedBgStyle = useMemo(() => ({
    backgroundColor: theme.colors.primaryContainer,
  }), [theme.colors.primaryContainer]);

  const selectedTextStyle = useMemo(() => ({
    fontWeight: '600' as const,
  }), []);

  const normalTextStyle = useMemo(() => ({
    fontWeight: '400' as const,
  }), []);

  const keyExtractor = useCallback((item: SelectionOption) => item.key, []);

  const renderItem = useCallback(({ item }: { item: SelectionOption }) => {
    const isSelected = item.key === selectedKey;

    return (
      <Pressable
        onPress={() => handleSelect(item.key)}
        style={({ pressed }) => [
          styles.optionRow,
          isSelected && selectedBgStyle,
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        {item.icon ? (
          <MaterialCommunityIcons
            name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={24}
            color={isSelected ? theme.colors.primary : theme.colors.onSurfaceVariant}
            style={styles.optionIcon}
          />
        ) : null}
        <View style={styles.optionText}>
          <Text variant="bodyMedium" style={isSelected ? selectedTextStyle : normalTextStyle}>
            {item.label}
          </Text>
          {item.description ? (
            <Text variant="bodySmall" style={descriptionStyle}>{item.description}</Text>
          ) : null}
        </View>
        {showCheck && isSelected ? (
          <MaterialCommunityIcons
            name="check"
            size={20}
            color={theme.colors.primary}
          />
        ) : null}
      </Pressable>
    );
  }, [selectedKey, handleSelect, selectedBgStyle, descriptionStyle, selectedTextStyle, normalTextStyle, showCheck, theme.colors.primary, theme.colors.onSurfaceVariant]);

  const emptyStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  return (
    <AnimatedDialog
      visible={visible}
      onDismiss={handleDismiss}
      showCloseButton={false}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <Text variant="titleLarge" style={styles.title}>{title}</Text>

      {searchable ? (
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={searchPlaceholder}
          mode="outlined"
          dense
          left={<TextInput.Icon icon="magnify" />}
          right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery('')} /> : undefined}
          style={styles.searchInput}
        />
      ) : null}

      <FlatList
        data={filteredOptions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        style={{ maxHeight }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          searchQuery ? (
            <Text variant="bodyMedium" style={[styles.emptyText, emptyStyle]}>
              Sin resultados
            </Text>
          ) : null
        }
      />
    </AnimatedDialog>
  );
});
SelectionDialog.displayName = 'SelectionDialog';

const styles = StyleSheet.create({
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  optionIcon: {
    width: 24,
  },
  optionText: {
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 24,
  },
});
