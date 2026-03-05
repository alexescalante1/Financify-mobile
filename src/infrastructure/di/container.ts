import "reflect-metadata";
import { container } from "tsyringe";
import { DI_TOKENS } from "@/domain/di/tokens";

// Firebase Services
import FirebaseFirestoreService from "@/infrastructure/firebase/core/services/FirestoreService";
import FirebaseRealtimeService from "@/infrastructure/firebase/core/services/RealtimeService";
import FirebaseStorageService from "@/infrastructure/firebase/core/services/StorageService";

// Firebase Instances
import { db, rtdb, storage } from "@/infrastructure/firebase/core/FirebaseConfiguration";

// Firestore Sub-services
import { FirestoreCrudService } from "@/infrastructure/firebase/core/services/firestore/FirestoreCrudService";
import { FirestoreQueryService } from "@/infrastructure/firebase/core/services/firestore/FirestoreQueryService";
import { FirestoreListenerService } from "@/infrastructure/firebase/core/services/firestore/FirestoreListenerService";
import { FirestoreBatchService } from "@/infrastructure/firebase/core/services/firestore/FirestoreBatchService";

// Realtime Sub-services
import { RealtimeCrudService } from "@/infrastructure/firebase/core/services/realtime/RealtimeCrudService";
import { RealtimeQueryService } from "@/infrastructure/firebase/core/services/realtime/RealtimeQueryService";
import { RealtimeListenerService } from "@/infrastructure/firebase/core/services/realtime/RealtimeListenerService";
import { RealtimeBatchService } from "@/infrastructure/firebase/core/services/realtime/RealtimeBatchService";
import { RealtimeConnectionService } from "@/infrastructure/firebase/core/services/realtime/RealtimeConnectionService";

// Storage Sub-services
import { StorageUploadService } from "@/infrastructure/firebase/core/services/storage/StorageUploadService";
import { StorageDownloadService } from "@/infrastructure/firebase/core/services/storage/StorageDownloadService";
import { StorageManagementService } from "@/infrastructure/firebase/core/services/storage/StorageManagementService";
import { StorageMetadataService } from "@/infrastructure/firebase/core/services/storage/StorageMetadataService";

// DAOs
import { UserDAO } from "@/infrastructure/firebase/features/user/UserDAO";

// Repositories - Auth/Platform
import { AuthRepository } from "@/infrastructure/firebase/features/auth/AuthRepository";
import { AuthStateRepository } from "@/infrastructure/firebase/features/auth/AuthStateRepository";
import { GoogleAuthRepository } from "@/infrastructure/firebase/features/auth/GoogleAuthRepository";
import { GoogleAuthService } from "@/infrastructure/firebase/features/auth/GoogleAuthService";
import { AuthStorageAdapter } from "@/infrastructure/storage/features/auth/AuthStorageAdapter";
import { AuthStorageService } from "@/infrastructure/storage/features/auth/AuthStorageService";
import { UserRepositoryImpl } from "@/infrastructure/firebase/features/user/UserRepositoryImpl";
import { NetworkRepositoryImpl } from "@/infrastructure/network/NetworkRepositoryImpl";

// Use Cases
import { LoginUseCase } from "@/application/auth/useCases/LoginUseCase";
import { LoginWithGoogleUseCase } from "@/application/auth/useCases/LoginWithGoogleUseCase";
import { LogoutUseCase } from "@/application/auth/useCases/LogoutUseCase";
import { RegisterUserUseCase } from "@/application/auth/useCases/RegisterUserUseCase";

// Storage Core
import { SQLiteStorageService } from "@/infrastructure/storage/core/SQLiteStorageService";

// ============================================
// 0. Firebase Instances (Values)
// ============================================
container.register(DI_TOKENS.FirestoreInstance, { useValue: db });
container.register(DI_TOKENS.RealtimeDbInstance, { useValue: rtdb });
container.register(DI_TOKENS.StorageInstance, { useValue: storage });

// ============================================
// 1a. Firebase Sub-services (Singletons)
// ============================================
container.registerSingleton(FirestoreCrudService);
container.registerSingleton(FirestoreQueryService);
container.registerSingleton(FirestoreListenerService);
container.registerSingleton(FirestoreBatchService);

container.registerSingleton(RealtimeCrudService);
container.registerSingleton(RealtimeQueryService);
container.registerSingleton(RealtimeListenerService);
container.registerSingleton(RealtimeBatchService);
container.registerSingleton(RealtimeConnectionService);

container.registerSingleton(StorageUploadService);
container.registerSingleton(StorageDownloadService);
container.registerSingleton(StorageManagementService);
container.registerSingleton(StorageMetadataService);

// ============================================
// 1b. Firebase Services (Singletons)
// ============================================
container.registerSingleton(DI_TOKENS.FirebaseFirestoreService, FirebaseFirestoreService);
container.registerSingleton(DI_TOKENS.FirebaseRealtimeService, FirebaseRealtimeService);
container.registerSingleton(DI_TOKENS.FirebaseStorageService, FirebaseStorageService);

// ============================================
// 2. DAOs & Internal Services (Singletons)
// ============================================
container.registerSingleton(UserDAO);
container.registerSingleton(GoogleAuthService);
container.registerSingleton(SQLiteStorageService);
container.registerSingleton(AuthStorageService);

// ============================================
// 3. Repositories
// ============================================

// Auth
container.register(DI_TOKENS.AuthRepository, { useClass: AuthRepository });
container.register(DI_TOKENS.AuthStateRepository, { useClass: AuthStateRepository });
container.register(DI_TOKENS.AuthStorageRepository, { useClass: AuthStorageAdapter });
container.register(DI_TOKENS.GoogleAuthRepository, { useClass: GoogleAuthRepository });

// User
container.register(DI_TOKENS.UserRepository, { useClass: UserRepositoryImpl });

// Network
container.register(DI_TOKENS.NetworkRepository, { useClass: NetworkRepositoryImpl });

// ============================================
// 4. Use Cases
// ============================================
container.register(DI_TOKENS.LoginUseCase, { useClass: LoginUseCase });
container.register(DI_TOKENS.LoginWithGoogleUseCase, { useClass: LoginWithGoogleUseCase });
container.register(DI_TOKENS.LogoutUseCase, { useClass: LogoutUseCase });
container.register(DI_TOKENS.RegisterUserUseCase, { useClass: RegisterUserUseCase });

// ============================================
// 5. Repositories — Pending Implementation
// ============================================
container.register(DI_TOKENS.TransactionRepository, {
  useFactory: () => {
    throw new Error(
      'TransactionRepository is not yet implemented. ' +
      'Create a concrete class and register it in container.ts.'
    );
  },
});

container.register(DI_TOKENS.TransactionStateRepository, {
  useFactory: () => {
    throw new Error(
      'TransactionStateRepository is not yet implemented. ' +
      'Create a concrete class and register it in container.ts.'
    );
  },
});

container.register(DI_TOKENS.WalletRepository, {
  useFactory: () => {
    throw new Error(
      'WalletRepository is not yet implemented. ' +
      'Create a concrete class and register it in container.ts.'
    );
  },
});

export { container };
