import React, { useMemo, useCallback } from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { CategoryIcon } from '@/presentation/components/icon/CategoryIcon';
import { SkeletonLoader } from '@/presentation/components/skeleton/SkeletonLoader';
import type { AppTheme } from '@/presentation/theme/materialTheme';

type TransactionType = 'income' | 'expense' | 'transfer';

interface TransactionCardProps {
  title: string;
  category: string;
  amount: number;
  type?: TransactionType;
  date?: string;
  status?: string;
  loading?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel?: string;
}

export const TransactionCard: React.FC<TransactionCardProps> = React.memo(({
  title,
  category,
  amount,
  type = 'expense',
  date,
  status,
  loading = false,
  onPress,
  style,
  testID,
  accessibilityLabel,
}) => {
  const theme = useTheme();
  const colors = theme.colors as AppTheme['colors'];

  const amountColor = useMemo(() => {
    if (type === 'income') return colors.profit;
    if (type === 'expense') return colors.loss;
    return colors.info;
  }, [type, colors.profit, colors.loss, colors.info]);

  const formattedAmount = useMemo(() => {
    const prefix = type === 'income' ? '+ ' : type === 'expense' ? '- ' : '';
    const abs = Math.abs(amount);
    return `${prefix}S/ ${abs.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [amount, type]);

  const subtitleStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
  }), [theme.colors.onSurfaceVariant]);

  const statusStyle = useMemo(() => ({
    color: theme.colors.onSurfaceVariant,
    backgroundColor: theme.colors.surfaceVariant,
  }), [theme.colors.onSurfaceVariant, theme.colors.surfaceVariant]);

  const amountStyle = useMemo(() => ({
    color: amountColor,
  }), [amountColor]);

  const pressableStyle = useCallback(({ pressed }: { pressed: boolean }) => [
    styles.container,
    pressed && onPress ? styles.pressed : undefined,
    style,
  ], [onPress, style]);

  if (loading) {
    return (
      <View
        style={[styles.container, style]}
        testID={testID}
        accessibilityLabel={accessibilityLabel || 'Cargando transacción'}
      >
        <SkeletonLoader variant="avatar" width={40} height={40} borderRadius={20} />
        <View style={styles.textColumn}>
          <SkeletonLoader width={120} height={16} borderRadius={4} />
          <SkeletonLoader width={80} height={12} borderRadius={4} style={styles.dateSkeleton} />
        </View>
        <View style={styles.rightColumn}>
          <SkeletonLoader width={70} height={16} borderRadius={4} />
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={pressableStyle}
      testID={testID}
      accessibilityLabel={accessibilityLabel || `${title} ${formattedAmount}`}
    >
      <CategoryIcon category={category} size="md" />
      <View style={styles.textColumn}>
        <Text variant="bodyLarge" numberOfLines={1} style={styles.title}>{title}</Text>
        {date ? (
          <Text variant="bodySmall" style={subtitleStyle} numberOfLines={1}>{date}</Text>
        ) : null}
      </View>
      <View style={styles.rightColumn}>
        <Text variant="bodyMedium" style={[styles.amount, amountStyle]}>
          {formattedAmount}
        </Text>
        {status ? (
          <Text variant="labelSmall" style={[styles.statusBadge, statusStyle]}>{status}</Text>
        ) : null}
      </View>
    </Pressable>
  );
});
TransactionCard.displayName = 'TransactionCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
  },
  pressed: {
    opacity: 0.7,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontWeight: '500',
  },
  dateSkeleton: {
    marginTop: 4,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  amount: {
    fontWeight: '600',
  },
  statusBadge: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
    fontSize: 10,
  },
});
