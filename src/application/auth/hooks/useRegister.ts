import { useState, useCallback } from 'react';
import { User } from '@/domain/entities/User';
import { UserRegistrationVo } from '@/domain/valueObjects/UserRegistrationVo';
import { useDependencies } from '@/presentation/di/DependencyProvider';

export const useRegister = () => {
  const { registerUserUseCase } = useDependencies();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const register = useCallback(async (input: UserRegistrationVo): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const registeredUser = await registerUserUseCase.execute(input);
      setUser(registeredUser);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrar usuario';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [registerUserUseCase]);

  return { register, loading, error, user };
};
