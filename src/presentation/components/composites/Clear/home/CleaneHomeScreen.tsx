import React, { useState, useMemo, useRef } from "react";
import { View, ScrollView, Dimensions, RefreshControl } from "react-native";
import { Text, ActivityIndicator, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/application/hooks/useAuth";
import { useTransactions } from "@/application/hooks/useTransactions";
import { AddMoneyModal } from "./AddMoneyModal";
import { RegularizeBalanceModal } from "./RegularizeBalanceModal";
import { HeaderSection } from "./components/HeaderSection";
import { BalanceCard } from "./components/BalanceCard";
import { ActionButtons } from "./components/ActionButtons";
import { PeriodSelector } from "./components/PeriodSelector";
import { PeriodSummary } from "./components/PeriodSummary";
import { BalanceChart } from "./components/BalanceChart";
import { TransactionListScreen } from "./transactions/TransactionListScreen";

// ============= TYPES =============
type ChartPeriod = "daily" | "monthly" | "quarterly" | "yearly";

interface PeriodTotals {
  [key: string]: number;
}

interface Summary {
  income: number;
  expenses: number;
  balance: number;
}

interface ChartDataset {
  data: number[];
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  createdAt: {
    toDate: () => Date;
  };
}

// ============= CONSTANTS =============
const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const PERIOD_TITLES: Record<ChartPeriod, string> = {
  daily: "Hoy",
  monthly: "Este Mes",
  quarterly: "Este Trimestre",
  yearly: "Este Año",
};

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

const CleaneHomeScreen: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const {
    transactions,
    loading,
    refreshTransactions,
    currentBalance,
    regularizeBalance,
  } = useTransactions();

  // ============= STATE =============
  const [showModal, setShowModal] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("monthly");
  const [showRegularizeModal, setShowRegularizeModal] =
    useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // ============= UTILITY FUNCTIONS =============
  const getDateKey = (date: Date, period: ChartPeriod): string => {
    const year = date.getFullYear();
    const month = date.getMonth();

    switch (period) {
      case "daily":
        return `${year}-${month + 1}-${date.getDate()}`;
      case "monthly":
        return `${year}-${month + 1}`;
      case "quarterly":
        const quarter = Math.floor(month / 3) + 1;
        return `${year}-Q${quarter}`;
      case "yearly":
        return `${year}`;
      default:
        return `${year}-${month + 1}`;
    }
  };

  const generateDailyLabels = (): string[] => {
    return Array.from(
      { length: 24 },
      (_, i) => `${i.toString().padStart(2, "0")}:00`
    );
  };

  const generateMonthlyLabels = (now: Date): string[] => {
    return Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now.getTime() - (29 - i) * MILLISECONDS_PER_DAY);
      return `${date.getDate()}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
    });
  };

  const generateQuarterlyLabels = (now: Date): string[] => {
    return Array.from({ length: 24 }, (_, i) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (23 - i));
      return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
    });
  };

  const generateYearlyLabels = (now: Date): string[] => {
    return Array.from({ length: 10 }, (_, i) =>
      (now.getFullYear() - 9 + i).toString()
    );
  };

  const getLabelsForPeriod = (period: ChartPeriod): string[] => {
    const now = new Date();

    switch (period) {
      case "daily":
        return generateDailyLabels();
      case "monthly":
        return generateMonthlyLabels(now);
      case "quarterly":
        return generateQuarterlyLabels(now);
      case "yearly":
        return generateYearlyLabels(now);
      default:
        return [];
    }
  };

  const getLabelKeyForTransaction = (
    date: Date,
    period: ChartPeriod,
    now: Date
  ): string | undefined => {
    switch (period) {
      case "daily":
        if (date.toDateString() === now.toDateString()) {
          return `${date.getHours().toString().padStart(2, "0")}:00`;
        }
        return undefined;

      case "monthly":
        const daysDiff = Math.floor(
          (now.getTime() - date.getTime()) / MILLISECONDS_PER_DAY
        );
        if (daysDiff <= 29 && daysDiff >= 0) {
          return `${date.getDate()}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        }
        return undefined;

      case "quarterly":
        const monthsDiff =
          (now.getFullYear() - date.getFullYear()) * 12 +
          (now.getMonth() - date.getMonth());
        if (monthsDiff <= 23 && monthsDiff >= 0) {
          return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear().toString().slice(-2)}`;
        }
        return undefined;

      case "yearly":
        const yearsBack = now.getFullYear() - date.getFullYear();
        if (yearsBack <= 9 && yearsBack >= 0) {
          return date.getFullYear().toString();
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const calculateCumulativeData = (data: number[]): number[] => {
    const cumulativeData: number[] = [];
    let runningTotal = 0;

    data.forEach((value) => {
      runningTotal += value;
      cumulativeData.push(runningTotal);
    });

    // Add minimal variation if no real data exists
    const hasRealData = cumulativeData.some((value) => value !== 0);
    if (!hasRealData) {
      return cumulativeData.map((_, index) => (index % 2) * 0.01);
    }

    return cumulativeData;
  };

  const getPeriodDateRange = (
    period: ChartPeriod
  ): { startDate: Date; endDate: Date } => {
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (period) {
      case "daily":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case "quarterly":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    }

    return { startDate, endDate };
  };

  const isTransactionInCurrentPeriod = (
    transaction: Transaction,
    period: ChartPeriod
  ): boolean => {
    if (!transaction.createdAt?.toDate) return false;

    const date = transaction.createdAt.toDate();
    const now = new Date();

    switch (period) {
      case "daily":
        return date.toDateString() === now.toDateString();
      case "monthly":
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      case "quarterly":
        const currentQ = Math.floor(now.getMonth() / 3);
        const transQ = Math.floor(date.getMonth() / 3);
        return currentQ === transQ && date.getFullYear() === now.getFullYear();
      case "yearly":
        return date.getFullYear() === now.getFullYear();
      default:
        return false;
    }
  };

  // ============= COMPUTED VALUES =============
  const chartData: ChartData = useMemo(() => {
    const labels = getLabelsForPeriod(chartPeriod);
    const periodTotals: PeriodTotals = {};
    const now = new Date();

    // Initialize period totals
    labels.forEach((label) => {
      periodTotals[label] = 0;
    });

    // Process transactions
    if (transactions.length > 0) {
      transactions.forEach((transaction) => {
        if (!transaction.createdAt?.toDate) return;

        const date = transaction.createdAt.toDate();
        const labelKey = getLabelKeyForTransaction(date, chartPeriod, now);

        if (labelKey && periodTotals.hasOwnProperty(labelKey)) {
          const amount =
            transaction.type === "income"
              ? transaction.amount
              : -transaction.amount;
          periodTotals[labelKey] += amount;
        }
      });
    }

    const data = labels.map((label) => periodTotals[label] || 0);
    const cumulativeData = calculateCumulativeData(data);

    return {
      labels,
      datasets: [{ data: cumulativeData }],
    };
  }, [transactions, chartPeriod]);

  const summary: Summary = useMemo(() => {
    const { startDate, endDate } = getPeriodDateRange(chartPeriod);
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach((transaction) => {
      if (!transaction.createdAt?.toDate) return;

      const date = transaction.createdAt.toDate();
      if (date >= startDate && date < endDate) {
        if (transaction.type === "income") {
          totalIncome += transaction.amount;
        } else {
          totalExpenses += transaction.amount;
        }
      }
    });

    return {
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  }, [transactions, chartPeriod]);

  const currentPeriodTransactions = useMemo(() => {
    return transactions.filter((transaction) =>
      isTransactionInCurrentPeriod(transaction, chartPeriod)
    );
  }, [transactions, chartPeriod]);

  // ============= EVENT HANDLERS =============
  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    try {
      await refreshTransactions();
    } catch (error: unknown) {
      console.error("Error al refrescar:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getPeriodTitle = (): string => {
    return PERIOD_TITLES[chartPeriod] || "Período";
  };

  // ============= LOADING STATE =============
  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator size="large" />
        <Text variant="bodyLarge" style={{ marginTop: 16 }}>
          Cargando datos financieros...
        </Text>
      </SafeAreaView>
    );
  }

  // ============= RENDER =============
  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={{
          flex: 1,
          padding: 16,
          backgroundColor: theme.colors.background,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <HeaderSection
          userName={user?.fullName || "Usuario"}
          loading={loading}
        />

        <BalanceCard currentBalance={currentBalance} />

        <ActionButtons
          onNewMovement={() => setShowModal(true)}
          onRegularize={() => setShowRegularizeModal(true)}
          loading={loading}
        />

        <PeriodSelector
          chartPeriod={chartPeriod}
          onPeriodChange={setChartPeriod}
        />

        <PeriodSummary
          summary={summary}
          periodTitle={getPeriodTitle()}
          transactionCount={currentPeriodTransactions.length}
        />

        <BalanceChart chartData={chartData} chartPeriod={chartPeriod} />

        <TransactionListScreen />

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* ============= MODALS ============= */}
      <AddMoneyModal
        visible={showModal}
        onDismiss={() => setShowModal(false)}
      />

      <RegularizeBalanceModal
        visible={showRegularizeModal}
        onDismiss={() => setShowRegularizeModal(false)}
        currentBalance={currentBalance}
        onRegularize={regularizeBalance}
        loading={loading}
      />
    </>
  );
};

export default CleaneHomeScreen;
