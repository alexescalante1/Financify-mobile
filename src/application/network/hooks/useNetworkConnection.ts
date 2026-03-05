import { useState, useEffect, useCallback } from 'react';
import { useDependencies } from '@/presentation/di/DependencyProvider';

interface HookNetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  hasRealInternetAccess: boolean;
}

export const useNetworkConnection = () => {
  const { networkRepository } = useDependencies();

  const [networkState, setNetworkState] = useState<HookNetworkState>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    hasRealInternetAccess: true,
  });

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const state = await networkRepository.getNetworkState();
      const realInternet = await networkRepository.validateInternetAccess();
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        hasRealInternetAccess: realInternet,
      });
      return realInternet;
    } catch {
      return false;
    }
  }, [networkRepository]);

  useEffect(() => {
    checkConnection();

    const unsubscribe = networkRepository.subscribe(async (state) => {
      const realInternet = await networkRepository.validateInternetAccess();
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        hasRealInternetAccess: realInternet,
      });
    });

    return () => unsubscribe();
  }, [networkRepository, checkConnection]);

  return {
    isConnected: networkState.isConnected,
    isInternetReachable: networkState.isInternetReachable,
    connectionType: networkState.type,
    hasRealInternetAccess: networkState.hasRealInternetAccess,
    checkConnection,
  };
};
