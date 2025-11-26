import { useState, useMemo } from "react";
import { container } from "tsyringe";
import { RegisterUserUseCase } from "@/application/useCases/auth/RegisterUserUseCase";
import { User } from "@/domain/models/User";
import { UserRegistrationVo } from "@/domain/valueObjects/UserRegistrationVo";

/**
 * Hook para manejar el registro de usuarios
 * Conecta la UI con el Use Case
 *
 * El use case se obtiene del contenedor de tsyringe (singleton)
 */
export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Resolver el use case una sola vez al inicializar el hook
  const registerUserUseCase = useMemo(
    () => container.resolve(RegisterUserUseCase),
    []
  );

  const register = async (input: UserRegistrationVo): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const registeredUser = await registerUserUseCase.execute(input);

      setUser(registeredUser);
    } catch (err: any) {
      const errorMessage = err.message || "Error al registrar usuario";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    register,
    loading,
    error,
    user,
  };
};
