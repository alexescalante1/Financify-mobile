import { useState, useEffect } from 'react';
import { useDependencies } from '@/presentation/di/DependencyProvider';

export const useAppInitializer = () => {
  const { authStorageRepository } = useDependencies();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await authStorageRepository.init();
      } catch {
        // Storage init failed — app continues with defaults
      } finally {
        setReady(true);
      }
    };
    init();
  }, [authStorageRepository]);

  return ready;
};
