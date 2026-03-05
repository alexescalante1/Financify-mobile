import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { ViewStyle } from 'react-native';
import { Searchbar, useTheme, ActivityIndicator } from 'react-native-paper';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: (text: string) => void;
  placeholder?: string;
  debounceMs?: number;
  loading?: boolean;
  autoFocus?: boolean;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const SearchBar: React.FC<SearchBarProps> = React.memo(({
  value,
  onChangeText,
  onSearch,
  placeholder = 'Buscar...',
  debounceMs = 300,
  loading = false,
  autoFocus = false,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!onSearch) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, debounceMs, onSearch]);

  const handleChangeText = useCallback((text: string) => {
    onChangeText(text);
  }, [onChangeText]);

  const searchBarStyle = useMemo(() => [
    {
      borderRadius: 12,
      elevation: 0,
      backgroundColor: theme.colors.surfaceVariant,
    },
    style,
  ], [theme.colors.surfaceVariant, style]);

  const primaryColor = theme.colors.primary;
  const loadingIcon = useMemo(() => {
    if (!loading) return undefined;
    return () => <ActivityIndicator size={20} color={primaryColor} />;
  }, [loading, primaryColor]);

  return (
    <Searchbar
      value={value}
      onChangeText={handleChangeText}
      placeholder={placeholder}
      style={searchBarStyle}
      icon={loading ? loadingIcon : 'magnify'}
      autoFocus={autoFocus}
      testID={testID}
      accessibilityLabel={accessibilityLabel || placeholder}
    />
  );
});

SearchBar.displayName = 'SearchBar';
