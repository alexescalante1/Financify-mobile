import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, ReactNode } from 'react';
import { Snackbar, useTheme } from 'react-native-paper';
import type { AppTheme } from '@/presentation/theme/materialTheme';

interface SnackbarOptions {
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
  type?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

interface SnackbarMessage {
  id: number;
  message: string;
  options: SnackbarOptions;
}

interface SnackbarContextValue {
  showSnackbar: (message: string, options?: SnackbarOptions) => void;
  hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

let messageIdCounter = 0;

export const SnackbarProvider: React.FC<{ children: ReactNode }> = React.memo(({ children }) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];

  const [queue, setQueue] = useState<SnackbarMessage[]>([]);
  const [current, setCurrent] = useState<SnackbarMessage | null>(null);
  const [visible, setVisible] = useState(false);

  const showSnackbar = useCallback((message: string, options: SnackbarOptions = {}) => {
    const newMessage: SnackbarMessage = {
      id: ++messageIdCounter,
      message,
      options,
    };
    setQueue(prev => [...prev, newMessage]);
  }, []);

  const hideSnackbar = useCallback(() => {
    setVisible(false);
  }, []);

  // When not visible and queue has items, show the next one after a brief delay
  useEffect(() => {
    if (visible || queue.length === 0) return;

    const timer = setTimeout(() => {
      const [next, ...rest] = queue;
      setCurrent(next);
      setVisible(true);
      setQueue(rest);
    }, current ? 200 : 0);

    return () => clearTimeout(timer);
  }, [visible, queue, current]);

  const contextValue = useMemo(() => ({
    showSnackbar,
    hideSnackbar,
  }), [showSnackbar, hideSnackbar]);

  const snackbarStyle = useMemo(() => {
    const typeColorMap: Record<string, string> = {
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
      info: colors.info,
      default: theme.colors.inverseSurface,
    };

    const type = current?.options.type || 'default';
    return {
      backgroundColor: typeColorMap[type] || theme.colors.inverseSurface,
    };
  }, [current?.options.type, colors, theme.colors.inverseSurface]);

  const snackbarAction = useMemo(() => ({
    label: current?.options.actionLabel || 'OK',
    onPress: current?.options.onAction || hideSnackbar,
  }), [current?.options.actionLabel, current?.options.onAction, hideSnackbar]);

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={hideSnackbar}
        duration={current?.options.duration ?? 4000}
        action={snackbarAction}
        style={snackbarStyle}
      >
        {current?.message || ''}
      </Snackbar>
    </SnackbarContext.Provider>
  );
});
SnackbarProvider.displayName = 'SnackbarProvider';

export const useSnackbar = (): SnackbarContextValue => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};
