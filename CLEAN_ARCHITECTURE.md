# Financify - Clean Architecture Implementation

## Estructura Completa Nueva (auth/)

Esta es una implementación **completamente nueva** y **profesional** de Clean Architecture, basada 100% en las **entidades de dominio**.

```
src/
├── domain/                                    # CAPA DE DOMINIO (núcleo)
│   ├── entities/                              # Entidades (reglas de negocio)
│   │   ├── User.ts                           # ✅ Entidad User (la que manda)
│   │   └── Wallet.ts                         # ✅ Entidad Wallet (la que manda)
│   │
│   └── repositories/                          # Interfaces de repositorios
│       ├── IUserRepository.ts                # ✅ Nuevo contrato
│       └── IWalletRepository.ts              # ✅ Nuevo contrato
│
├── application/                               # CAPA DE APLICACIÓN
│   ├── useCases/                              # Casos de uso
│   │   └── RegisterUserUseCase.ts            # ✅ Nuevo Use Case
│   │
│   └── hooks/                                 # Hooks de React
│       └── auth/
│           └── useRegister.ts                # ✅ Nuevo hook
│
├── infrastructure/                            # CAPA DE INFRAESTRUCTURA
│   └── persistence/
│       └── firestore/                         # Implementación Firestore
│           ├── dtos/                          # DTOs de Firestore
│           │   ├── UserFirestoreDTO.ts       # ✅ Nuevo DTO
│           │   └── WalletFirestoreDTO.ts     # ✅ Nuevo DTO
│           │
│           ├── mappers/                       # Mappers Entity ↔ DTO
│           │   ├── UserFirestoreMapper.ts    # ✅ Nuevo mapper
│           │   └── WalletFirestoreMapper.ts  # ✅ Nuevo mapper
│           │
│           ├── daos/                          # DAOs (acceso a datos)
│           │   ├── UserFirestoreDAO.ts       # ✅ Nuevo DAO
│           │   └── WalletFirestoreDAO.ts     # ✅ Nuevo DAO
│           │
│           └── repositories/                  # Implementaciones
│               ├── UserRepositoryImpl.ts     # ✅ Nueva implementación
│               └── WalletRepositoryImpl.ts   # ✅ Nueva implementación
│
└── presentation/                              # CAPA DE PRESENTACIÓN
    └── screens/
        └── Internal/
            └── auth/                          # ✅ Nueva carpeta auth/
                └── RegisterScreen.tsx         # ✅ Nueva pantalla
```

## Flujo de Registro (Completamente Nuevo)

```
┌─────────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ RegisterScreen.tsx (auth/)                                │  │
│  │ - Formulario con validación Yup                           │  │
│  │ - Usa useRegister hook                                    │  │
│  └────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ useRegister.ts                                            │  │
│  │ - Maneja estado (loading, error)                          │  │
│  │ - Llama a RegisterUserUseCase                             │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │ RegisterUserUseCase.ts                                    │  │
│  │ - Orquesta UserRepository + WalletRepository              │  │
│  │ - Maneja errores de Firebase                              │  │
│  └────────────────────────┬─────────────────────────────────┘  │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                       DOMAIN LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ IUserRepository.ts                                        │  │
│  │ - registerWithAuth()                                      │  │
│  │ - save()                                                  │  │
│  │ - findById()                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ IWalletRepository.ts                                      │  │
│  │ - create()                                                │  │
│  │ - findById()                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ UserRepositoryImpl.ts                                     │  │
│  │ ├─► Firebase Auth (createUserWithEmailAndPassword)        │  │
│  │ ├─► UserFirestoreMapper.toFirestore()                     │  │
│  │ └─► UserFirestoreDAO.save()                               │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │ UserFirestoreDAO.ts                                       │  │
│  │ └─► Firestore: users/{userId}                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ WalletRepositoryImpl.ts                                   │  │
│  │ ├─► WalletFirestoreDAO.getNextId()                        │  │
│  │ ├─► WalletFirestoreMapper.toFirestore()                   │  │
│  │ └─► WalletFirestoreDAO.save()                             │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                            │                                     │
│  ┌────────────────────────▼─────────────────────────────────┐  │
│  │ WalletFirestoreDAO.ts                                     │  │
│  │ └─► Firestore: users/{userId}/Wallets/{walletId}          │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Estructura de Firestore (Sin cambios)

```
Firestore
└── users (collection)
    └── {userId} (document - estructura de User entity)
        ├── id: string
        ├── email: string
        ├── fullName: string
        ├── gender: GenderType
        ├── birthDate: string
        ├── currency: CurrencyType
        ├── language: string
        ├── country: { code: string, name: string }
        ├── preferences: { notificationsEnabled: boolean, defaultWalletId: string | null }
        ├── metadata: { createdAt: string, updatedAt: string }
        ├── status: StatusType
        │
        └── Wallets (subcollection - estructura de Wallet entity)
            └── {walletId} (document)
                ├── id: number
                ├── name: string
                ├── description: string
                ├── _idType: number
                ├── _idAssetType: number
                ├── balance: number
                ├── currency: CurrencyType
                ├── createdAt: string
                └── isPrimary: boolean
```

## Principios SOLID Aplicados

### ✅ Single Responsibility Principle (SRP)
- **UserFirestoreDAO**: Solo CRUD en Firestore
- **UserFirestoreMapper**: Solo transformación Entity ↔ DTO
- **UserRepositoryImpl**: Solo coordinar DAO + Mapper + Auth
- **RegisterUserUseCase**: Solo lógica de negocio de registro
- **useRegister**: Solo gestión de estado UI

### ✅ Open/Closed Principle (OCP)
- Interfaces `IUserRepository` y `IWalletRepository` permiten extensión
- Puedes crear `UserSQLiteRepositoryImpl` sin modificar el dominio

### ✅ Liskov Substitution Principle (LSP)
- Cualquier implementación de `IUserRepository` es intercambiable
- Cualquier implementación de `IWalletRepository` es intercambiable

### ✅ Interface Segregation Principle (ISP)
- Interfaces pequeñas y específicas
- `IUserRepository` solo con métodos de User
- `IWalletRepository` solo con métodos de Wallet

### ✅ Dependency Inversion Principle (DIP)
- Use Cases dependen de **interfaces** (IUserRepository, IWalletRepository)
- Implementaciones se inyectan vía tsyringe
- Dominio NO depende de infraestructura

## Inyección de Dependencias

### Archivo: `container.config.ts`

```typescript
// 1. Registrar DAOs
container.registerSingleton(UserFirestoreDAO);
container.registerSingleton(WalletFirestoreDAO);

// 2. Registrar Repositories con factory
container.register<IUserRepository>("IUserRepository", {
  useFactory: (c) => {
    const dao = c.resolve(UserFirestoreDAO);
    return new UserRepositoryImpl(dao);
  },
});

// 3. Registrar Use Cases con factory
container.register(RegisterUserUseCase, {
  useFactory: (c) => {
    const userRepo = c.resolve<IUserRepository>("IUserRepository");
    const walletRepo = c.resolve<IWalletRepo>("IWalletRepo");
    return new RegisterUserUseCase(userRepo, walletRepo);
  },
});
```

## Uso en el Código

### En RegisterScreen:

```typescript
import { useRegister } from "@/application/hooks/auth/useRegister";

const { register, loading, error } = useRegister();

await register({
  email: values.email,
  password: values.password,
  fullName: values.fullName,
  gender: values.gender,
  birthDate: values.birthDate,
  currency: values.currency,
});
```

## Ventajas de esta Arquitectura

### 1. ✅ Basada en Entidades de Dominio
- Las entidades `User` y `Wallet` definen la estructura
- DTOs mapean 1:1 con las entidades
- Todo respeta el dominio

### 2. ✅ Completamente Nueva
- Carpeta separada `auth/` en presentation
- Nueva estructura de carpetas en infrastructure
- Sin tocar código legacy

### 3. ✅ Testeable
- Use Cases 100% testables sin Firebase
- Repositorios mockeables fácilmente
- DAOs aislados

### 4. ✅ Mantenible
- Cada archivo tiene una responsabilidad
- Fácil encontrar y modificar código
- Cambios localizados

### 5. ✅ Escalable
- Agregar nuevas features es trivial
- Cambiar implementaciones sin tocar dominio
- Reutilización máxima

## Comparación: Antes vs Ahora

### ❌ Antes (Legacy)
```
RegisterScreen
    → useAuth.register()
        → AuthRepository (acoplado a Firestore)
            → setDoc() directo
        → WalletRepository (acoplado a Firestore)
            → setDoc() directo
```

### ✅ Ahora (Clean Architecture)
```
RegisterScreen (auth/)
    → useRegister()
        → RegisterUserUseCase
            → IUserRepository ────┐
            → IWalletRepository ──┤
                                  │
                    (Dependency Injection)
                                  │
            UserRepositoryImpl ◄──┤
                → UserFirestoreMapper
                → UserFirestoreDAO
                    → Firestore
                                  │
            WalletRepositoryImpl ◄┘
                → WalletFirestoreMapper
                → WalletFirestoreDAO
                    → Firestore
```

## Próximos Pasos

1. ✅ Agregar LoginUserUseCase
2. ✅ Agregar LogoutUserUseCase
3. ✅ Agregar UpdateUserUseCase
4. ✅ Tests unitarios para Use Cases
5. ✅ Tests de integración para Repositories

## Notas Importantes

- **NO toques** los archivos legacy de `start/`
- **USA** los archivos nuevos de `auth/`
- Las **entidades de dominio** son las que mandan
- **Respeta** la separación de capas
- **NO** dependas de implementaciones, solo de interfaces
