import { container } from "tsyringe";

import { IAuthRepository } from "@/domain/repository/IAuthRepository";
import { AuthRepository } from "@/infrastructure/firebase/repository/auth/AuthRepository";
container.registerSingleton<IAuthRepository>("IAuthRepository", AuthRepository);

import { IAuthStateRepository } from "@/domain/repository/IAuthStateRepository";
import { AuthStateRepository } from "@/infrastructure/firebase/repository/auth/AuthStateRepository";
container.registerSingleton<IAuthStateRepository>(
  "IAuthStateRepository",
  AuthStateRepository
);

import { ITransactionRepository } from "@/domain/repository/ITransactionRepository";
import { TransactionRepository } from "@/infrastructure/firebase/repository/transaction/TransactionRepository";
container.registerSingleton<ITransactionRepository>(
  "ITransactionRepository",
  TransactionRepository
);

import { ITransactionStateRepository } from "@/domain/repository/ITransactionStateRepository";
import { TransactionStateRepository } from "@/infrastructure/firebase/repository/transaction/TransactionStateRepository";
container.registerSingleton<ITransactionStateRepository>(
  "ITransactionStateRepository",
  TransactionStateRepository
);

import { IWalletRepository } from "@/domain/interfaces/repository/IWalletRepository";
import { WalletRepository } from "@/infrastructure/firebase/repository/WalletRepository.refactored";
container.registerSingleton<IWalletRepository>(
  "IWalletRepository",
  WalletRepository
);

// Registrar Use Cases
import { IRegisterUserUseCase } from "@/domain/useCases/IRegisterUserUseCase";
import { RegisterUserUseCase } from "@/application/useCases/RegisterUserUseCase";
container.registerSingleton<IRegisterUserUseCase>(
  "IRegisterUserUseCase",
  RegisterUserUseCase
);
