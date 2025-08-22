import { container } from "tsyringe";
import { useState, useEffect, useCallback } from "react";

import { useAuth } from "@/application/hooks/useAuth";
import { Wallet } from "@/domain/entities/Wallet";
import { IWalletRepository } from "@/domain/interfaces/repository/IWalletRepository";

// ========================================
// HELPER PARA OBTENER EL REPOSITORY
// ========================================

const getWalletRepository = (): IWalletRepository => {
  return container.resolve<IWalletRepository>("IWalletRepository");
};

// ========================================
// HOOKS DE LECTURA (LISTENERS)
// ========================================

/**
 * Hook para escuchar wallets por rango de fechas
 */
export const useWalletsByDate = (startDate: Date, endDate: Date) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const walletRepository = getWalletRepository();
    
    const unsubscribe = walletRepository.listenToWalletsByDate(
      user.id,
      startDate,
      endDate,
      (newWallets) => {
        console.log(`📡 Received ${newWallets.length} wallets for date range`);
        setWallets(newWallets);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Error listening to wallets by date:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      console.log("🔌 Disconnecting wallets by date listener");
      unsubscribe();
    };
  }, [user?.id, startDate.getTime(), endDate.getTime()]);

  return { wallets, loading, error };
};

/**
 * Hook para escuchar todas las wallets del usuario
 */
export const useAllWallets = () => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const walletRepository = getWalletRepository();
    
    const unsubscribe = walletRepository.listenToAllWallets(
      user.id,
      (newWallets) => {
        console.log(`📡 Received ${newWallets.length} wallets`);
        setWallets(newWallets);
        setLoading(false);
      },
      (err) => {
        console.error("❌ Error listening to all wallets:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      console.log("🔌 Disconnecting all wallets listener");
      unsubscribe();
    };
  }, [user?.id]);

  return { wallets, loading, error };
};

/**
 * Hook para escuchar una wallet específica
 */
export const useWallet = (walletId: number) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id || !walletId) {
      setWallet(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const walletRepository = getWalletRepository();
    
    const unsubscribe = walletRepository.listenToWallet(
      user.id,
      walletId,
      (updatedWallet) => {
        console.log(`📡 Wallet ${walletId} updated`);
        setWallet(updatedWallet);
        setLoading(false);
      },
      (err) => {
        console.error(`❌ Error listening to wallet ${walletId}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      console.log(`🔌 Disconnecting wallet ${walletId} listener`);
      unsubscribe();
    };
  }, [user?.id, walletId]);

  return { wallet, loading, error };
};

/**
 * Hook para obtener la wallet primaria del usuario
 */
export const usePrimaryWallet = () => {
  const { user } = useAuth();
  const [primaryWallet, setPrimaryWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrimaryWallet = useCallback(async () => {
    if (!user?.id) {
      setPrimaryWallet(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletRepository = getWalletRepository();
      const wallet = await walletRepository.getPrimaryWallet(user.id);
      
      console.log(`🌟 Primary wallet fetched:`, wallet);
      setPrimaryWallet(wallet);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching primary wallet:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPrimaryWallet();
  }, [fetchPrimaryWallet]);

  return { 
    primaryWallet, 
    loading, 
    error, 
    refetch: fetchPrimaryWallet 
  };
};

/**
 * Hook para obtener wallets por tipo
 */
export const useWalletsByType = (type: string) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWalletsByType = useCallback(async () => {
    if (!user?.id || !type) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletRepository = getWalletRepository();
      const typeWallets = await walletRepository.getWalletsByType(user.id, type);
      
      console.log(`🏷️ Found ${typeWallets.length} wallets of type "${type}"`);
      setWallets(typeWallets);
      setLoading(false);
    } catch (err) {
      console.error(`❌ Error fetching wallets by type "${type}":`, err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user?.id, type]);

  useEffect(() => {
    fetchWalletsByType();
  }, [fetchWalletsByType]);

  return { 
    wallets, 
    loading, 
    error, 
    refetch: fetchWalletsByType 
  };
};

/**
 * Hook para obtener wallets por moneda
 */
export const useWalletsByCurrency = (currency: string) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWalletsByCurrency = useCallback(async () => {
    if (!user?.id || !currency) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletRepository = getWalletRepository();
      const currencyWallets = await walletRepository.getWalletsByCurrency(user.id, currency);
      
      console.log(`💱 Found ${currencyWallets.length} wallets with currency "${currency}"`);
      setWallets(currencyWallets);
      setLoading(false);
    } catch (err) {
      console.error(`❌ Error fetching wallets by currency "${currency}":`, err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user?.id, currency]);

  useEffect(() => {
    fetchWalletsByCurrency();
  }, [fetchWalletsByCurrency]);

  return { 
    wallets, 
    loading, 
    error, 
    refetch: fetchWalletsByCurrency 
  };
};

/**
 * Hook para buscar wallets por nombre
 */
export const useWalletSearch = (searchTerm: string) => {
  const { user } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchWallets = useCallback(async (term: string) => {
    if (!user?.id || !term.trim()) {
      setWallets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletRepository = getWalletRepository();
      const searchResults = await walletRepository.searchWalletsByName(user.id, term);
      
      console.log(`🔍 Found ${searchResults.length} wallets matching "${term}"`);
      setWallets(searchResults);
      setLoading(false);
    } catch (err) {
      console.error(`❌ Error searching wallets with term "${term}":`, err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user?.id]);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchWallets(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchWallets]);

  return { 
    wallets, 
    loading, 
    error, 
    search: searchWallets 
  };
};

/**
 * Hook para obtener balance total por moneda
 */
export const useTotalBalance = (currency: string) => {
  const { user } = useAuth();
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTotalBalance = useCallback(async () => {
    if (!user?.id || !currency) {
      setTotalBalance(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletRepository = getWalletRepository();
      const total = await walletRepository.getTotalBalanceByCurrency(user.id, currency);
      
      console.log(`💰 Total balance for ${currency}: ${total}`);
      setTotalBalance(total);
      setLoading(false);
    } catch (err) {
      console.error(`❌ Error fetching total balance for "${currency}":`, err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user?.id, currency]);

  useEffect(() => {
    fetchTotalBalance();
  }, [fetchTotalBalance]);

  return { 
    totalBalance, 
    loading, 
    error, 
    refetch: fetchTotalBalance 
  };
};

/**
 * Hook para contar wallets del usuario
 */
export const useWalletCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchWalletCount = useCallback(async () => {
    if (!user?.id) {
      setCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const walletRepository = getWalletRepository();
      const walletCount = await walletRepository.getWalletCount(user.id);
      
      console.log(`🔢 User has ${walletCount} wallets`);
      setCount(walletCount);
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching wallet count:", err);
      setError(err as Error);
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchWalletCount();
  }, [fetchWalletCount]);

  return { 
    count, 
    loading, 
    error, 
    refetch: fetchWalletCount 
  };
};

// ========================================
// HOOKS DE ESCRITURA (OPERACIONES)
// ========================================

/**
 * Hook para crear wallets
 */
export const useCreateWallet = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createWallet = useCallback(async (walletData: Omit<Wallet, 'id' | 'createdAt'>): Promise<Wallet | null> => {
    if (!user?.id) {
      const authError = new Error("User not authenticated");
      setError(authError);
      throw authError;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`📝 Creating wallet "${walletData.name}" for user ${user.id}`);
      
      const walletRepository = getWalletRepository();
      const newWallet = await walletRepository.register(user.id, walletData as Wallet);
      
      console.log(`✅ Wallet created successfully with ID: ${newWallet.id}`);
      setLoading(false);
      return newWallet;
    } catch (err) {
      console.error("❌ Error creating wallet:", err);
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [user?.id]);

  return { 
    createWallet, 
    loading, 
    error,
    clearError: () => setError(null)
  };
};

/**
 * Hook para actualizar wallets
 */
export const useUpdateWallet = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateWallet = useCallback(async (
    walletId: number, 
    updates: Partial<Wallet>
  ): Promise<boolean> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Updating wallet ${walletId} for user ${user.id}`);
      
      const walletRepository = getWalletRepository();
      const success = await walletRepository.updateWallet(user.id, walletId, updates);
      
      if (success) {
        console.log(`✅ Wallet ${walletId} updated successfully`);
      }
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error(`❌ Error updating wallet ${walletId}:`, err);
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [user?.id]);

  return { 
    updateWallet, 
    loading, 
    error,
    clearError: () => setError(null)
  };
};

/**
 * Hook para eliminar wallets
 */
export const useDeleteWallet = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteWallet = useCallback(async (walletId: number): Promise<boolean> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🗑️ Deleting wallet ${walletId} for user ${user.id}`);
      
      const walletRepository = getWalletRepository();
      const success = await walletRepository.deleteWallet(user.id, walletId);
      
      if (success) {
        console.log(`✅ Wallet ${walletId} deleted successfully`);
      }
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error(`❌ Error deleting wallet ${walletId}:`, err);
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [user?.id]);

  return { 
    deleteWallet, 
    loading, 
    error,
    clearError: () => setError(null)
  };
};

/**
 * Hook para establecer wallet primaria
 */
export const useSetPrimaryWallet = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setPrimaryWallet = useCallback(async (walletId: number): Promise<boolean> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`🌟 Setting wallet ${walletId} as primary for user ${user.id}`);
      
      const walletRepository = getWalletRepository();
      const success = await walletRepository.setPrimaryWallet(user.id, walletId);
      
      if (success) {
        console.log(`✅ Wallet ${walletId} set as primary successfully`);
      }
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error(`❌ Error setting wallet ${walletId} as primary:`, err);
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [user?.id]);

  return { 
    setPrimaryWallet, 
    loading, 
    error,
    clearError: () => setError(null)
  };
};

/**
 * Hook para actualizar balance
 */
export const useUpdateBalance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateBalance = useCallback(async (
    walletId: number, 
    newBalance: number
  ): Promise<boolean> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`💰 Updating balance of wallet ${walletId} to ${newBalance}`);
      
      const walletRepository = getWalletRepository();
      const success = await walletRepository.updateBalance(user.id, walletId, newBalance);
      
      if (success) {
        console.log(`✅ Balance updated successfully`);
      }
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error(`❌ Error updating balance for wallet ${walletId}:`, err);
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [user?.id]);

  return { 
    updateBalance, 
    loading, 
    error,
    clearError: () => setError(null)
  };
};

/**
 * Hook para incrementar balance
 */
export const useIncrementBalance = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const incrementBalance = useCallback(async (
    walletId: number, 
    amount: number
  ): Promise<boolean> => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    setLoading(true);
    setError(null);

    try {
      console.log(`📈 Incrementing balance of wallet ${walletId} by ${amount}`);
      
      const walletRepository = getWalletRepository();
      const success = await walletRepository.incrementBalance(user.id, walletId, amount);
      
      if (success) {
        console.log(`✅ Balance incremented successfully`);
      }
      
      setLoading(false);
      return success;
    } catch (err) {
      console.error(`❌ Error incrementing balance for wallet ${walletId}:`, err);
      setError(err as Error);
      setLoading(false);
      throw err;
    }
  }, [user?.id]);

  return { 
    incrementBalance, 
    loading, 
    error,
    clearError: () => setError(null)
  };
};

// ========================================
// HOOKS ESPECIALIZADOS
// ========================================

/**
 * Hook para wallets de este mes
 */
export const useWalletsThisMonth = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return useWalletsByDate(startOfMonth, endOfMonth);
};

/**
 * Hook para wallets de esta semana
 */
export const useWalletsThisWeek = () => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
  
  return useWalletsByDate(startOfWeek, endOfWeek);
};

/**
 * Hook para wallets de hoy
 */
export const useWalletsToday = () => {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  return useWalletsByDate(startOfDay, endOfDay);
};