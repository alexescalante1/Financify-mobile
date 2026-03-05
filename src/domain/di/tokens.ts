/**
 * Type-safe DI tokens for tsyringe container.
 * Centralizes all string tokens to prevent typos and enable refactoring.
 *
 * Lives in domain/ so that application/ and infrastructure/ can both
 * import tokens without violating the dependency-inversion rule.
 */

// Firebase Services
export const DI_TOKENS = {
  // Firebase Instances
  FirestoreInstance: 'FirestoreInstance',
  RealtimeDbInstance: 'RealtimeDbInstance',
  StorageInstance: 'StorageInstance',

  // Services
  FirebaseFirestoreService: 'IFirebaseFirestoreService',
  FirebaseRealtimeService: 'IFirebaseRealtimeService',
  FirebaseStorageService: 'IFirebaseStorageService',

  // Repositories - Implemented
  AuthRepository: 'IAuthRepository',
  AuthStateRepository: 'IAuthStateRepository',
  AuthStorageRepository: 'IAuthStorageRepository',
  GoogleAuthRepository: 'IGoogleAuthRepository',
  UserRepository: 'IUserRepository',
  NetworkRepository: 'INetworkRepository',

  // Use Cases
  LoginUseCase: 'LoginUseCase',
  LoginWithGoogleUseCase: 'LoginWithGoogleUseCase',
  LogoutUseCase: 'LogoutUseCase',
  RegisterUserUseCase: 'RegisterUserUseCase',

  // Repositories - Pending implementation (register in container when ready)
  TransactionRepository: 'ITransactionRepository',
  TransactionStateRepository: 'ITransactionStateRepository',
  WalletRepository: 'IWalletRepository',
  WalletCrudRepository: 'IWalletCrudRepository',
  WalletStateRepository_Wallet: 'IWalletStateRepository_Wallet',
  WalletQueryRepository: 'IWalletQueryRepository',
} as const;

export type DIToken = (typeof DI_TOKENS)[keyof typeof DI_TOKENS];
