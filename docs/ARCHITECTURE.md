# ========================================
# ========================================
# ARQUITECTURA CLEAN — FINANCIFY MOBILE
# ========================================
# ========================================

## Stack tecnologico

| Categoria | Tecnologia | Version |
|-----------|-----------|---------|
| Framework | React Native | 0.81.5 |
| Plataforma | Expo SDK | 54 |
| Lenguaje | TypeScript | 5.9 |
| Backend | Firebase JS SDK | 11.10 |
| UI Library | react-native-paper (MD3) | 5.14.5 |
| DI Container | tsyringe | 4.10 |
| Navegacion | React Navigation | 7.x |
| Formularios | Formik + Yup | 2.4 / 1.6 |
| Animaciones | react-native-reanimated | 4.1 |
| Storage local | expo-sqlite + AsyncStorage | 16.0 / 2.2 |

## Mapa de capas

```
┌──────────────┐
│ presentation │  Screens, Components, Hooks de UI, Navigation, Theme
└──────┬───────┘
       ▼
┌──────────────┐
│ application  │  UseCases, Hooks de negocio, Services
└──────┬───────┘
       ▼
┌──────────────┐
│   domain     │  Entities, Interfaces, Types, Errors, Value Objects
└──────┬───────┘
       ▲
┌──────┴───────┐
│infrastructure│  Firebase, SQLite, AsyncStorage, DI Container, Network
└──────────────┘
```

**Regla de dependencias global**: Las flechas indican la unica direccion permitida.
`presentation` → `application` → `domain` ← `infrastructure`. Ninguna capa importa hacia arriba.

---

# ========================================
# Arquitectura de Dominio
# ========================================
> Estandar de desarrollo para la capa de dominio (`domain/`).
> Esta capa contiene las entidades, interfaces, tipos y reglas de negocio
> que definen el modelo del sistema. No depende de ninguna otra capa.

---

## 1. Principios

La capa de dominio se organiza bajo un principio de **independencia absoluta**:
define QUE es el sistema sin saber COMO se implementa.

Esta separacion garantiza que:
- Las entidades y reglas de negocio no cambian cuando cambia la base de datos, el framework o la UI.
- Los contratos (interfaces) definen los puertos que la infraestructura implementa.
- El dominio es portable — puede funcionar en otro proyecto TypeScript sin modificaciones.

---

## 2. Glosario

**Entidad**: `interface` con propiedades `readonly` que modela un concepto de negocio.
Ejemplo: `User`, `Wallet`, `Transaction`.

**Value Object**: Estructura inmutable de entrada sin identidad propia, definida por sus valores.
Ejemplo: `UserRegistrationVo` (datos de registro), `WalletUpdateVo` (datos de actualizacion).

**Tipo de dominio**: Type alias que codifica conocimiento de negocio.
Ejemplo: `CurrencyType = "PEN" | "USD"`, `WalletType` con 13 variantes.

**Interfaz de repositorio (puerto)**: Contrato que define las operaciones
que la infraestructura debe implementar. El dominio declara; la infraestructura cumple.
Ejemplo: `IAuthRepository`, `IWalletRepository`.

**Error tipado**: Discriminated union que modela errores de negocio sin depender
de mensajes de texto, con factory object para creacion.
Ejemplo: `AuthError` con tipo `'INVALID_CREDENTIALS'`, factory `AuthErrors.invalidCredentials()`.

**Result<T>**: Tipo generico para manejo de errores type-safe.
Success: `{ success: true; data: T }`. Failure: `{ success: false; error: AppError }`.

---

## 3. Estructura general

```
domain/
├── entities/          Modelos de negocio inmutables
│   ├── User.ts        Usuario del sistema
│   ├── Wallet.ts      Billetera/cuenta del usuario
│   └── Transaction.ts Transaccion financiera con detalle
├── repository/        Interfaces de repositorio (puertos)
│   ├── IAuthRepository.ts
│   ├── IAuthStateRepository.ts
│   ├── IAuthStorageRepository.ts
│   ├── IGoogleAuthRepository.ts
│   ├── INetworkRepository.ts
│   ├── ITransactionRepository.ts
│   ├── ITransactionStateRepository.ts
│   ├── IUserRepository.ts
│   └── IWalletRepository.ts
├── errors/            Errores tipados por feature
│   ├── AuthErrors.ts
│   ├── TransactionErrors.ts
│   └── WalletErrors.ts
├── types/             Tipos de dominio y utilidades
│   ├── CategoryType.ts
│   ├── CurrencyType.ts
│   ├── GenderType.ts
│   ├── StatusType.ts
│   ├── WalletType.ts
│   ├── GoogleUserInfo.ts
│   └── Result.ts
├── valueObjects/      Estructuras de entrada inmutables
│   ├── UserRegistrationVo.ts
│   ├── UserUpdateVo.ts
│   └── WalletUpdateVo.ts
└── constants/         Catalogos de dominio
    └── WalletTypeCatalogItem.ts
```

---

## 4. Modulos

### 4.1 entities/

**Alcance**: Modelos de datos inmutables que representan conceptos de negocio.
Todas las propiedades son `readonly`.

| Archivo | Exports | Responsabilidad |
|---------|---------|-----------------|
| `User.ts` | `User` | Usuario: id, email, fullName, gender, birthDate, currency, language, country, preferences, metadata, status |
| `Wallet.ts` | `Wallet`, `CreateWalletInput` | Billetera: id, name, description, typeId, assetTypeId, balance, currency, createdAt, isPrimary. `CreateWalletInput` = `Omit<Wallet, 'id'>` |
| `Transaction.ts` | `Transaction`, `TransactionDetail`, `CreateTransactionInput`, `CreateTransactionDetail` | Transaccion: userId, walletId, categoryId, type (income/expense), amount, description, detail[], createdAt, isRegularization, isActive |

**Composicion de User**:
```
User
├── country: { code, name }           (readonly nested)
├── preferences: { notificationsEnabled, defaultWalletId }
└── metadata: { createdAt, updatedAt }
```

**Composicion de Transaction**:
```
Transaction
└── detail: readonly TransactionDetail[]   (array inmutable de sub-items)
    └── TransactionDetail: { id, amount, description }
```

---

### 4.2 repository/

**Alcance**: Interfaces (puertos) que definen los contratos para la infraestructura.

| Archivo | Responsabilidad |
|---------|-----------------|
| `IAuthRepository` | Registro, login (email y Google), logout, getCurrentUser, updateUser, isGoogleUser |
| `IAuthStateRepository` | Listener reactivo de estado de auth: `onAuthStateChanged(callback)` retorna unsubscribe |
| `IAuthStorageRepository` | Persistencia de sesion local: saveUser, getSessionInfo, clearAuthData, refreshSession. Define `SessionInfo` |
| `IGoogleAuthRepository` | Google OAuth: `signIn()` retorna `GoogleAuthResult` (token + userInfo) |
| `INetworkRepository` | Conectividad: getNetworkState, subscribe, validateInternetAccess. Define `NetworkState` |
| `ITransactionRepository` | CRUD de transacciones: add, getByUser, getCurrentBalance, delete, updateDetail |
| `ITransactionStateRepository` | Listener reactivo: `onTransactionsChanged(userId, callback)` retorna unsubscribe |
| `IUserRepository` | Persistencia de usuario: save, findById, update, exists |
| `IWalletRepository` | Compuesto: extiende `IWalletCrudRepository` + `IWalletStateRepository` + `IWalletQueryRepository` |

**Composicion de IWalletRepository**:
```
IWalletRepository
├── IWalletCrudRepository    register, getById, getAll, update, delete
├── IWalletStateRepository   listenToWalletsByDate, listenToAll, listenToWallet
└── IWalletQueryRepository   getPrimary, setPrimary, getByType, getByCurrency, updateBalance,
                             incrementBalance, searchByName, getTotalByCurrency, getCount
```

---

### 4.3 errors/

**Alcance**: Errores tipados como discriminated unions con factory objects.

| Archivo | Tipos de error | Factory |
|---------|---------------|---------|
| `AuthErrors.ts` | INVALID_CREDENTIALS, USER_NOT_FOUND, EMAIL_ALREADY_IN_USE, WEAK_PASSWORD, NETWORK_ERROR, NOT_AUTHENTICATED, GOOGLE_AUTH_FAILED, SESSION_EXPIRED, UNKNOWN_AUTH_ERROR | `AuthErrors.invalidCredentials()`, `.userNotFound()`, etc. |
| `TransactionErrors.ts` | TRANSACTION_NOT_FOUND, INVALID_AMOUNT, INVALID_DETAIL, REGULARIZATION_FAILED, UNKNOWN_TRANSACTION_ERROR | `TransactionErrors.notFound()`, `.invalidAmount()`, etc. |
| `WalletErrors.ts` | WALLET_NOT_FOUND, WALLET_ALREADY_EXISTS, INSUFFICIENT_BALANCE, INVALID_WALLET_DATA, UNKNOWN_WALLET_ERROR | `WalletErrors.notFound()`, `.insufficientBalance()`, etc. |

**Patron de error**:
```typescript
// Discriminated union
type AuthError =
  | { type: 'INVALID_CREDENTIALS'; message: string }
  | { type: 'USER_NOT_FOUND'; message: string }
  // ...

// Factory object
const AuthErrors = {
  invalidCredentials: (msg?) => ({ type: 'INVALID_CREDENTIALS', message: msg ?? '...' }),
  // ...
};
```

---

### 4.4 types/

**Alcance**: Tipos de dominio que codifican conocimiento de negocio.

| Archivo | Export | Valores |
|---------|--------|---------|
| `CategoryType.ts` | `CategoryType` | `"income" \| "expense"` |
| `CurrencyType.ts` | `CurrencyType` | `"PEN" \| "USD"` |
| `GenderType.ts` | `GenderType` | `"male" \| "female"` |
| `StatusType.ts` | `StatusType` | `"active" \| "inactive" \| "suspended"` |
| `WalletType.ts` | `WalletType` | 13 variantes: special, bankAccount, salaryAccount, savingsAccount, severanceAccount, investmentAccount, mutualFund, digitalWallet, crypto, debitCard, creditCard, cash, other |
| `GoogleUserInfo.ts` | `GoogleUserInfo` | `{ email, name, picture? }` |
| `Result.ts` | `Result<T>`, `AppError` | Result monad con `ok()`, `fail()`, `isOk()`, `isFail()`, `unwrap()`, `map()`. `AppError` = union de AuthError, TransactionError, WalletError |

---

### 4.5 valueObjects/

**Alcance**: Estructuras inmutables de entrada desde la presentacion hacia la aplicacion.

| Archivo | Campos (todos `readonly`) |
|---------|--------------------------|
| `UserRegistrationVo` | fullName, email, password, birthDate, gender, currency |
| `UserUpdateVo` | fullName?, gender?, birthDate?, currency?, language?, country?, preferences?, status? (todos opcionales) |
| `WalletUpdateVo` | name?, description?, balance?, currency?, isPrimary? (todos opcionales) |

---

### 4.6 constants/

| Archivo | Export | Responsabilidad |
|---------|--------|-----------------|
| `WalletTypeCatalogItem.ts` | `WalletTypeCatalogItem` | Interface de catalogo: `{ id, value: WalletType, label, description }` |

---

## 5. Reglas

### 5.1 Regla de independencia

El dominio **no debe** importar de ninguna otra capa:
- `infrastructure/` — Prohibido. Solo se comunica via interfaces.
- `application/` — Prohibido. La aplicacion consume el dominio, no al reves.
- `presentation/` — Prohibido.
- Librerias externas — Prohibido. Solo TypeScript stdlib.

### 5.2 Regla de inmutabilidad

Todas las entidades son `interface` con propiedades `readonly`:
- Modificaciones se hacen creando nuevos objetos con spread operator `{ ...entity, field: newValue }`.
- No usar propiedades mutables.
- Los arrays en entidades son `readonly` (ej: `readonly TransactionDetail[]`).

### 5.3 Regla de errores tipados

Los errores de dominio se modelan como discriminated unions:
- Cada variante tiene un `type` string literal para pattern matching.
- Factory objects proveen metodos de creacion con mensajes default.
- Las capas superiores manejan errores por `type`, no por string.

### 5.4 Regla de interfaces

Los contratos de repositorio definen el QUE, no el COMO:
- Usan tipos de dominio en firmas (entidades, types, value objects).
- Retornan `Promise<T>` para operaciones async.
- Listeners retornan funciones `() => void` para unsubscribe.
- No exponen detalles de implementacion (Firebase, SQLite, AsyncStorage).

---

## 6. Convenciones de naming

| Concepto | Patron | Ejemplo |
|----------|--------|---------|
| Entidad de negocio | Nombre descriptivo (interface) | `User`, `Wallet`, `Transaction` |
| Input de creacion | `Create{Entidad}Input` | `CreateWalletInput`, `CreateTransactionInput` |
| Value object | `{Nombre}Vo` | `UserRegistrationVo`, `WalletUpdateVo` |
| Tipo de dominio | Nombre descriptivo | `CurrencyType`, `WalletType`, `GenderType` |
| Interfaz de repositorio | `I{Nombre}Repository` | `IAuthRepository`, `IWalletRepository` |
| Error tipado | `{Feature}Error` (union) + `{Feature}Errors` (factory) | `AuthError` + `AuthErrors` |
| Catalogo | `{Nombre}CatalogItem` | `WalletTypeCatalogItem` |

---

## 7. Procedimiento para agregar una entidad nueva

1. Crear el archivo en `domain/entities/` como `interface` con propiedades `readonly`.
2. Si la entidad necesita input de creacion, definir `Create{Nombre}Input` como `Omit<Entidad, 'id'>`.
3. Si necesita input de actualizacion, crear Value Object en `domain/valueObjects/` con campos opcionales.
4. Si tiene sub-entidades, agruparlas en el mismo archivo.
5. Verificar que no importa de ninguna otra capa.

## 8. Procedimiento para agregar una interfaz de repositorio

1. Crear el archivo en `domain/repository/` con prefijo `I`.
2. Definir los metodos usando solo tipos de dominio.
3. Usar `Promise<T>` para operaciones async.
4. Listeners retornan `() => void` para unsubscribe.
5. La implementacion concreta va en `infrastructure/`, nunca en dominio.

---

# ========================================
# Arquitectura de Aplicacion
# ========================================
> Estandar de desarrollo para la capa de aplicacion (`application/`).
> Esta capa orquesta los casos de uso del sistema combinando repositorios
> e infraestructura. Es el punto de entrada que consume la capa de presentacion.

---

## 1. Principios

La capa de aplicacion se organiza bajo un principio de **orquestacion de casos de uso**:
los UseCases coordinan operaciones entre repositorios y contienen logica
especifica de cada caso de uso.

Esta separacion garantiza que:
- La capa de presentacion consume un unico punto de entrada por operacion, sin conocer la infraestructura.
- La logica de negocio de entidades vive en el dominio; la logica de casos de uso vive en aplicacion.
- Los UseCases son delgados, inyectables y faciles de testear.

---

## 2. Glosario

**UseCase**: Clase `@injectable()` que orquesta una operacion de negocio.
Recibe repositorios via `@inject(DI_TOKENS.*)` en el constructor.
Expone un unico metodo `execute()`.
Ejemplo: `LoginUseCase` orquesta auth + storage en el flujo de login.

**Hook de aplicacion**: Funcion React que adapta UseCases o repositorios
para consumo en componentes. Gestiona estado local (loading, error, data).
Ejemplo: `useAuth()` gestiona la sesion completa, `useRegister()` gestiona el registro.

**Service**: Clase que gestiona estado complejo de larga duracion.
No es inyectable via DI — se instancia como singleton en hooks.
Ejemplo: `AuthSessionManager` mantiene el estado de sesion con listeners de Firebase.

---

## 3. Estructura general

```
application/
├── auth/                  Feature de autenticacion
│   ├── useCases/          Casos de uso inyectables
│   │   ├── LoginUseCase.ts
│   │   ├── LoginWithGoogleUseCase.ts
│   │   ├── LogoutUseCase.ts
│   │   └── RegisterUserUseCase.ts
│   ├── hooks/             Hooks React para consumo en UI
│   │   ├── useAuth.ts
│   │   └── useRegister.ts
│   └── services/          Servicios de estado
│       └── AuthSessionManager.ts
├── core/                  Funcionalidad central
│   └── hooks/
│       └── useAppInitializer.ts
└── network/               Conectividad
    └── hooks/
        └── useNetworkConnection.ts
```

---

## 4. Modulos

### 4.1 auth/useCases/

**Alcance**: Operaciones de autenticacion como clases inyectables.

| Archivo | Dependencias DI | Metodo | Responsabilidad |
|---------|----------------|--------|-----------------|
| `LoginUseCase` | `AuthRepository`, `AuthStorageRepository` | `execute(email, password): Promise<User>` | Login email → guardar user + loginMethod en storage |
| `LoginWithGoogleUseCase` | `AuthRepository`, `AuthStorageRepository`, `GoogleAuthRepository` | `execute(): Promise<User \| null>` | Google OAuth → login con token → guardar user + loginMethod |
| `LogoutUseCase` | `AuthRepository`, `AuthStorageRepository` | `execute(): Promise<void>` | Limpiar storage → cerrar sesion Firebase |
| `RegisterUserUseCase` | `AuthRepository` | `execute(userData: UserRegistrationVo): Promise<User>` | Delegar registro al repositorio de auth |

**Patron de UseCase**:
```typescript
@injectable()
export class LoginUseCase {
  constructor(
    @inject(DI_TOKENS.AuthRepository) private readonly authRepository: IAuthRepository,
    @inject(DI_TOKENS.AuthStorageRepository) private readonly authStorage: IAuthStorageRepository,
  ) {}

  async execute(email: string, password: string): Promise<User> {
    const user = await this.authRepository.login(email, password);
    await this.authStorage.saveUser(user);
    await this.authStorage.saveLoginMethod('email');
    return user;
  }
}
```

---

### 4.2 auth/hooks/

**Alcance**: Hooks React que adaptan UseCases para consumo en componentes.

| Archivo | Dependencias | Retorno | Responsabilidad |
|---------|-------------|---------|-----------------|
| `useAuth` | loginUseCase, loginWithGoogleUseCase, logoutUseCase, authStateRepository, authStorageRepository | `{ user, loading, error, isInitialized, isAuthenticated, login, loginWithGoogle, logout, checkIsGoogleUser, forceStabilize }` | Estado completo de sesion con inicializacion, listeners Firebase y estabilizacion |
| `useRegister` | registerUserUseCase | `{ register, loading, error, user }` | Registro de usuario con estado de carga y error |

**useAuth — Flujo de inicializacion**:
```
1. Primer subscribe → AuthSessionManager.initialize()
2. authStorage.init() + cleanupOrRefresh()
3. Si sesion local valida → cargar user, setup Firebase listener
4. Si sesion expirada → limpiar datos, setup Firebase listener
5. Firebase listener sincroniza cambios remotos con estabilizacion (debounce 300ms)
```

---

### 4.3 auth/services/

| Archivo | Responsabilidad |
|---------|-----------------|
| `AuthSessionManager` | Singleton de estado de sesion. Gestiona listeners (observer pattern), inicializacion lazy, Firebase listener con debounce 500ms, estabilizacion de estado para evitar thrashing de UI |

**AuthSessionManager — Estado**:
```typescript
AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}
```

**Metodos publicos**: `subscribe(listener)`, `updateState(updates)`, `stableUpdateState(updates, delay?)`, `forceStabilize()`, `destroy()`

---

### 4.4 core/hooks/

| Archivo | Responsabilidad |
|---------|-----------------|
| `useAppInitializer` | Gate de inicializacion: llama `authStorageRepository.init()` al montar. Retorna `ready: boolean` |

### 4.5 network/hooks/

| Archivo | Responsabilidad |
|---------|-----------------|
| `useNetworkConnection` | Monitor de red: subscribe a cambios, valida acceso real a internet (ping Google 204). Retorna `{ isConnected, isInternetReachable, connectionType, hasRealInternetAccess, checkConnection }` |

---

## 5. Reglas

### 5.1 Regla de dependencias

La capa de aplicacion solo puede importar de:
- `domain/` — Entidades, interfaces de repositorio, errores tipados, types, value objects.

**Dependencias prohibidas**:
- `infrastructure/` — Nunca importar implementaciones concretas. Solo interfaces de dominio.
- `presentation/` — La presentacion consume aplicacion, no al reves.

**Nota**: Los hooks de aplicacion actualmente importan `useDependencies()` de `presentation/di/DependencyProvider`.
Esto es una adaptacion pragmatica al modelo React donde los hooks necesitan acceso al contexto DI.
En un escenario ideal, los hooks vivirian en `presentation/` y solo los UseCases en `application/`.

### 5.2 Regla de UseCases

Todo UseCase sigue el patron:
- Decorado con `@injectable()`.
- Dependencias inyectadas via `@inject(DI_TOKENS.*)` en constructor.
- Unico metodo publico: `execute(...)`.
- Sin estado interno — es stateless.
- Registrado en `infrastructure/di/container.ts`.

### 5.3 Regla de hooks

Los hooks de aplicacion son adaptadores React:
- Gestionan estado local (loading, error, data) con `useState`.
- Llaman UseCases o repositorios dentro de `useCallback`.
- No contienen logica de negocio — solo orquestacion y gestion de estado UI.
- Retornan objetos planos con datos y funciones.

---

## 6. Convenciones de naming

| Concepto | Patron | Ejemplo |
|----------|--------|---------|
| Caso de uso | `{Accion}UseCase` | `LoginUseCase`, `RegisterUserUseCase` |
| Hook de feature | `use{Feature}` | `useAuth`, `useRegister` |
| Hook de utilidad | `use{Proposito}` | `useAppInitializer`, `useNetworkConnection` |
| Servicio de estado | `{Feature}SessionManager` o `{Feature}Manager` | `AuthSessionManager` |
| Carpeta de feature | Nombre del feature en singular | `auth/`, `network/` |

---

## 7. Procedimiento para agregar un caso de uso nuevo

1. Crear el archivo en `application/{feature}/useCases/{Accion}UseCase.ts`.
2. Decorar la clase con `@injectable()`.
3. Inyectar repositorios via `@inject(DI_TOKENS.*)` en el constructor.
4. Implementar `execute(...)` como unico metodo publico.
5. Agregar el token en `infrastructure/di/tokens.ts`.
6. Registrar en `infrastructure/di/container.ts`.
7. Exponer en `presentation/di/DependencyProvider.tsx` si lo consumen hooks.
8. Verificar que solo importa de `domain/`.

---

# ========================================
# Arquitectura de Infraestructura
# ========================================
> Estandar de desarrollo para la capa de infraestructura (`infrastructure/`).
> Esta capa implementa los contratos definidos en el dominio, conectando
> la aplicacion con servicios externos (Firebase, SQLite, AsyncStorage).
> Es la unica capa que conoce los detalles de persistencia y comunicacion.

---

## 1. Principios

La capa de infraestructura se organiza bajo un principio de **implementacion por tecnologia**:
cada subsistema agrupa todo lo necesario para una tecnologia especifica.

Esta separacion garantiza que:
- Cambiar de proveedor (ej: Firebase → Supabase) afecta solo un subsistema.
- Los detalles de implementacion no se filtran hacia capas superiores.
- Cada subsistema es cohesivo: sus errores, sus servicios, sus repositorios y sus mappers viven juntos.

---

## 2. Glosario

**Subsistema**: Carpeta de primer nivel dentro de `infrastructure/` que encapsula
una tecnologia completa. Cada subsistema tiene una parte `core/` (generica)
y una parte `features/` (especifica de negocio).
Ejemplo: `firebase/core/` (wrappers genericos) + `firebase/features/` (AuthRepository).

**Servicio core**: Clase `@injectable()` que wrappea una SDK externa en una interfaz propia.
Desacopla el resto de la app de la API original del proveedor.
Ejemplo: `FirestoreCrudService` wrappea las operaciones CRUD de Firestore.

**Servicio facade**: Clase `@injectable()` que agrega multiples servicios core granulares
en una unica interfaz unificada. Simplifica el consumo para features.
Ejemplo: `FirebaseFirestoreService` agrega Crud + Query + Listener + Batch.

**Repositorio feature**: Clase `@injectable()` que implementa una interfaz de dominio
usando los servicios core o facades. Contiene la logica de mapeo y persistencia.
Ejemplo: `AuthRepository` implementa `IAuthRepository` usando Firebase Auth + UserDAO.

**DAO (Data Access Object)**: Clase que encapsula el acceso directo a una coleccion
de base de datos. CRUD puro sin logica de negocio.
Ejemplo: `UserDAO` accede a la coleccion `users` de Firestore.

**DTO (Data Transfer Object)**: Interface que modela la estructura de un documento
en la base de datos. Puede diferir de la entidad de dominio.
Ejemplo: `UserDTO` es el schema del documento Firestore de usuario.

**Mapper**: Clase con metodos estaticos que transforma entre entidades de dominio y DTOs.
Ejemplo: `UserMapper.toDomain(dto)`, `UserMapper.toDTO(entity)`.

**Adapter**: Clase que implementa una interfaz de dominio delegando a un servicio interno.
Ejemplo: `AuthStorageAdapter` implementa `IAuthStorageRepository` delegando a `AuthStorageService`.

**Excepcion tipada**: Union type que modela errores especificos de una tecnologia.
Ejemplo: `FirebaseAuthException` con code `'auth/invalid-credential'`.

---

## 3. Estructura general

```
infrastructure/
├── di/                        Inyeccion de dependencias
│   ├── tokens.ts              Tokens type-safe para tsyringe
│   └── container.ts           Registro centralizado de dependencias
├── firebase/                  Firebase (Auth, Firestore, RealtimeDB, Storage)
│   ├── core/                  Wrappers genericos de SDKs Firebase
│   │   ├── FirebaseConfiguration.ts  Inicializacion de Firebase
│   │   ├── collections.ts    Rutas centralizadas de colecciones Firestore
│   │   ├── errors/            Excepciones tipadas por servicio
│   │   │   ├── AuthException.ts
│   │   │   ├── FirestoreException.ts
│   │   │   └── RealtimeException.ts
│   │   ├── services/
│   │   │   ├── firestore/     Sub-servicios granulares de Firestore
│   │   │   │   ├── FirestoreCrudService.ts
│   │   │   │   ├── FirestoreQueryService.ts
│   │   │   │   ├── FirestoreListenerService.ts
│   │   │   │   ├── FirestoreBatchService.ts
│   │   │   │   ├── FirestoreTypes.ts
│   │   │   │   └── firestoreQueryBuilder.ts
│   │   │   ├── realtime/      Sub-servicios granulares de Realtime DB
│   │   │   │   ├── RealtimeCrudService.ts
│   │   │   │   ├── RealtimeQueryService.ts
│   │   │   │   ├── RealtimeListenerService.ts
│   │   │   │   ├── RealtimeBatchService.ts
│   │   │   │   ├── RealtimeConnectionService.ts
│   │   │   │   ├── RealtimeTypes.ts
│   │   │   │   └── realtimeQueryBuilder.ts
│   │   │   └── storage/       Sub-servicios granulares de Cloud Storage
│   │   │       ├── StorageUploadService.ts
│   │   │       ├── StorageDownloadService.ts
│   │   │       ├── StorageManagementService.ts
│   │   │       ├── StorageMetadataService.ts
│   │   │       └── StorageTypes.ts
│   │   ├── FirestoreService.ts    Facade: agrega Crud+Query+Listener+Batch
│   │   ├── RealtimeService.ts     Facade: agrega Crud+Query+Listener+Batch+Connection
│   │   └── StorageService.ts      Facade: agrega Upload+Download+Management+Metadata
│   └── features/              Repositorios de negocio sobre Firebase
│       ├── auth/              Autenticacion
│       │   ├── AuthRepository.ts
│       │   ├── AuthStateRepository.ts
│       │   ├── GoogleAuthRepository.ts
│       │   └── GoogleAuthService.ts
│       └── user/              Persistencia de usuario
│           ├── UserDAO.ts
│           ├── UserDTO.ts
│           ├── UserMapper.ts
│           └── UserRepositoryImpl.ts
├── network/                   Conectividad
│   └── NetworkRepositoryImpl.ts
└── storage/                   Almacenamiento local
    ├── core/                  Servicios genericos de storage
    │   ├── SQLiteStorageService.ts   expo-sqlite (finanzas_storage.db)
    │   └── StorageService.ts         AsyncStorage wrapper
    └── features/              Managers especificos por feature
        └── auth/              Persistencia de sesion
            ├── AuthStorageService.ts    Servicio con cache en memoria (5s TTL)
            └── AuthStorageAdapter.ts    Adapter: IAuthStorageRepository → AuthStorageService
```

---

## 4. Modulos

### 4.1 di/

**Alcance**: Configuracion centralizada de inyeccion de dependencias con tsyringe.

| Archivo | Responsabilidad |
|---------|-----------------|
| `tokens.ts` | Constantes type-safe para tokens DI: `DI_TOKENS.AuthRepository`, `DI_TOKENS.LoginUseCase`, etc. |
| `container.ts` | Registro centralizado de todas las dependencias en orden de resolucion |

**Orden de registro en container.ts**:
```
1. Firebase instances (useValue): db, rtdb, storage
2. Sub-servicios core (registerSingleton): FirestoreCrud, RealtimeCrud, etc.
3. Servicios facade (registerSingleton): FirebaseFirestoreService, etc.
4. DAOs y servicios (registerSingleton): UserDAO, GoogleAuthService, SQLiteStorageService, AuthStorageService
5. Repositorios (register): AuthRepository, UserRepository, NetworkRepository, etc.
6. UseCases (register): LoginUseCase, LogoutUseCase, RegisterUserUseCase, etc.
```

**Tokens DI registrados**:

| Token | Implementacion |
|-------|---------------|
| `FirestoreInstance` | Firestore db instance |
| `RealtimeDbInstance` | Realtime Database instance |
| `StorageInstance` | Cloud Storage instance |
| `FirebaseFirestoreService` | Facade de Firestore |
| `FirebaseRealtimeService` | Facade de Realtime DB |
| `FirebaseStorageService` | Facade de Storage |
| `AuthRepository` | `AuthRepository` → `IAuthRepository` |
| `AuthStateRepository` | `AuthStateRepository` → `IAuthStateRepository` |
| `AuthStorageRepository` | `AuthStorageAdapter` → `IAuthStorageRepository` |
| `GoogleAuthRepository` | `GoogleAuthRepository` → `IGoogleAuthRepository` |
| `UserRepository` | `UserRepositoryImpl` → `IUserRepository` |
| `NetworkRepository` | `NetworkRepositoryImpl` → `INetworkRepository` |
| `LoginUseCase` | `LoginUseCase` |
| `LoginWithGoogleUseCase` | `LoginWithGoogleUseCase` |
| `LogoutUseCase` | `LogoutUseCase` |
| `RegisterUserUseCase` | `RegisterUserUseCase` |

**Tokens pendientes de implementacion**: `TransactionRepository`, `TransactionStateRepository`, `WalletRepository`.

---

### 4.2 firebase/core/

**Alcance**: Wrappers genericos que desacoplan la app de las SDKs de Firebase.
No contienen logica de negocio — solo traducen la API de Firebase a interfaces propias.

#### 4.2.1 Configuracion

| Archivo | Responsabilidad |
|---------|-----------------|
| `FirebaseConfiguration.ts` | Inicializa Firebase con variables de entorno (`EXPO_PUBLIC_FIREBASE_*`). Exporta `auth`, `db`, `rtdb`, `storage` |
| `collections.ts` | Constantes de colecciones Firestore: `USERS`. Path builders: `userWallets(userId)`, `userTransactions(userId)`, `userDoc(userId)`, etc. |

#### 4.2.2 Excepciones

| Archivo | Tipos de error | Helper |
|---------|---------------|--------|
| `AuthException.ts` | 10 tipos: invalid-credential, user-not-found, wrong-password, email-already-in-use, weak-password, network-request-failed, too-many-requests, user-disabled, invalid-email, unknown | `mapFirebaseAuthError(error)` |
| `FirestoreException.ts` | 6 tipos: not-found, permission-denied, unavailable, deadline-exceeded, already-exists, unknown | `mapFirestoreError(error)` |
| `RealtimeException.ts` | 6 tipos: not-found, permission-denied, unavailable, disconnected, write-canceled, unknown | `mapRealtimeError(error)` |

#### 4.2.3 Servicios Firestore

**Patron**: 4 sub-servicios granulares + 1 facade agregador.

| Archivo | Responsabilidad |
|---------|-----------------|
| `FirestoreCrudService` | CRUD: getDocument, addDocument, setDocument, updateDocument, deleteDocument, exists, count, arrayField, incrementField, timestamps, references |
| `FirestoreQueryService` | Queries: getPaginatedDocuments, searchDocuments (text range) |
| `FirestoreListenerService` | Listeners real-time: listenToDocument, listenToCollection, listenByDateRange, listenWithFilters, listenToLatest, listenToPaginated, disconnectAll |
| `FirestoreBatchService` | Operaciones atomicas: executeBatchOperations, multiPathUpdate, executeTransaction |
| `FirestoreTypes.ts` | Interfaces: FirestoreQueryOptions, PaginationOptions, BatchOperation, ListenerOptions, DateRangeOptions |
| `firestoreQueryBuilder.ts` | Funcion pura: construye Firebase Query con where, orderBy, limit, pagination |
| **`FirestoreService`** (facade) | **Agrega todos los metodos de Crud+Query+Listener+Batch en una unica clase** |

#### 4.2.4 Servicios Realtime Database

**Patron**: 5 sub-servicios granulares + 1 facade agregador.

| Archivo | Responsabilidad |
|---------|-----------------|
| `RealtimeCrudService` | CRUD por path: get, set, update, delete, push. Utilities: validate, sanitize, snapshotToObject/Array, securityInfo |
| `RealtimeQueryService` | Queries: getPaginated, searchByChildValue, getDataInRange, countItems |
| `RealtimeListenerService` | Listeners: listenToPath, listenToValue, listenToChild{Added,Changed,Removed,Moved}, disconnectAll |
| `RealtimeBatchService` | Operaciones atomicas: executeBatch, multiPathUpdate, transaction, incrementValue, appendToArray |
| `RealtimeConnectionService` | Conectividad: connectionState, serverTimestamp, userPresence, onlineUsers, cache, persistence |
| `RealtimeTypes.ts` | Interfaces: RealtimeQueryOptions, ListenerOptions, BatchOperation, ConnectionState, PresenceInfo |
| `realtimeQueryBuilder.ts` | Funcion pura: aplica orderBy, filtros, limits a DatabaseReference |
| **`RealtimeService`** (facade) | **Agrega todos los metodos de Crud+Query+Listener+Batch+Connection** |

#### 4.2.5 Servicios Cloud Storage

**Patron**: 4 sub-servicios granulares + 1 facade agregador.

| Archivo | Responsabilidad |
|---------|-----------------|
| `StorageUploadService` | Upload: file, fileWithDetails, fileWithProgress, multiple, fromBase64, fromURL |
| `StorageDownloadService` | Download: getDownloadURL, downloadFile, downloadAsBuffer |
| `StorageManagementService` | Gestion: delete, deleteMultiple, deleteFolder, copy, move, rename, listFiles, search, filter, folderInfo, exists, validate |
| `StorageMetadataService` | Metadata: getFileMetadata, updateMetadata, getFileInfo |
| `StorageTypes.ts` | Interfaces: UploadOptions, UploadProgress, UploadResult, FileInfo, FolderInfo, BatchUploadResult |
| **`StorageService`** (facade) | **Agrega todos los metodos + operaciones avanzadas: backup, sync, cleanupTemp** |

---

### 4.3 firebase/features/

**Alcance**: Repositorios que implementan las interfaces de dominio usando los servicios core.

#### 4.3.1 features/auth/

| Archivo | Implementa | Responsabilidad |
|---------|-----------|-----------------|
| `AuthRepository` | `IAuthRepository` | Registro (Auth + UserDAO), login email, login Google, logout, getCurrentUser, updateUser, isGoogleUser |
| `AuthStateRepository` | `IAuthStateRepository` | Listener reactivo de `onAuthStateChanged` via Firebase Auth. Obtiene User completo del repo |
| `GoogleAuthService` | — (servicio interno) | OAuth2 con Google via `expo-auth-session` (PKCE enabled). Retorna token + userInfo |
| `GoogleAuthRepository` | `IGoogleAuthRepository` | Adapter: delega `signIn()` a GoogleAuthService |

#### 4.3.2 features/user/

| Archivo | Responsabilidad |
|---------|-----------------|
| `UserDAO` | Acceso directo a coleccion `users` de Firestore: create, getById, update, exists |
| `UserDTO` | Interface del documento Firestore: schema completo del usuario |
| `UserMapper` | Transformacion bidireccional: `toDomain(dto)`, `toDTO(entity)`, `toPartialDTO(updates)`, `toDomainList(dtos)` |
| `UserRepositoryImpl` | Implementa `IUserRepository`: save, findById, update, exists. Usa UserDAO + UserMapper |

---

### 4.4 network/

| Archivo | Implementa | Responsabilidad |
|---------|-----------|-----------------|
| `NetworkRepositoryImpl` | `INetworkRepository` | Usa `@react-native-community/netinfo` para estado de red. Valida internet real con ping a Google 204 |

---

### 4.5 storage/core/

**Alcance**: Infraestructura generica de persistencia local.

| Archivo | Backend | Responsabilidad |
|---------|---------|-----------------|
| `SQLiteStorageService` | expo-sqlite (`finanzas_storage.db`) | Storage tipado con tabla `storage(key, value, type, created_at, updated_at)`. Soporta prefixes, batch ops, objects con merge parcial |
| `StorageService` | AsyncStorage | Key-value simple. Soporta nested properties, pattern clearing, backup/restore, storage info |

---

### 4.6 storage/features/auth/

| Archivo | Responsabilidad |
|---------|-----------------|
| `AuthStorageService` | Persistencia de sesion sobre SQLiteStorageService. Prefix: `FinanzasAuth`. Cache en memoria con TTL 5s. Session expiration (30 dias). Keys: currentUser, authState, lastLogin, loginMethod, sessionVersion |
| `AuthStorageAdapter` | Implementa `IAuthStorageRepository` delegando a AuthStorageService. Patron Adapter |

---

## 5. Reglas

### 5.1 Regla de dependencias

La capa de infraestructura puede importar de:
- `domain/` — Entidades, interfaces, types, errors, value objects.
- SDKs externas — Firebase, expo-sqlite, AsyncStorage, netinfo, expo-auth-session.

**Dependencias prohibidas**:
- `application/` — La infraestructura no conoce los casos de uso.
- `presentation/` — La infraestructura no conoce la presentacion.
- Entre subsistemas: `firebase/` no debe importar de `storage/` ni viceversa (excepto via DI).

### 5.2 Regla core vs features

Cada subsistema separa lo generico de lo especifico:
- **core/**: Wrappers reutilizables, tipos, error mappers. No contiene logica de negocio.
- **features/**: Implementaciones concretas de interfaces de dominio. Contiene mapeo y persistencia especifica.

Un cambio de proveedor reemplaza `core/`; un cambio de modelo de negocio modifica `features/`.

### 5.3 Regla de DI centralizado

Toda la configuracion DI vive en `di/container.ts`:
- Los tokens se definen en `di/tokens.ts` como constantes string.
- El registro sigue un orden estricto (instances → singletons → repos → use cases).
- Services core se registran como singletons.
- Repositorios y UseCases se registran con `useClass`.

### 5.4 Regla de mappers

Los modelos de infraestructura no se exponen a otras capas:
- Los mappers convierten entre entidades de dominio y DTOs de infraestructura.
- Los mappers viven junto al feature que los usa (ej: `UserMapper` en `features/user/`).
- Las respuestas de Firebase se mapean a entidades de dominio antes de salir del repositorio.

### 5.5 Regla de excepciones

Los errores de SDKs externas se envuelven en tipos propios:
- Cada servicio core tiene su exception type (`FirebaseAuthException`, `FirestoreException`, `RealtimeException`).
- Funciones `map{Sdk}Error(error)` normalizan errores crudos.
- Los repositorios capturan excepciones de SDK y las propagan como errores tipados o `throw`.

### 5.6 Regla de facade

Los servicios Firebase siguen el patron facade:
- Sub-servicios granulares: un archivo por responsabilidad (Crud, Query, Listener, Batch).
- Facade: agrega todos los sub-servicios en una unica clase inyectable.
- Los features pueden consumir el facade completo o sub-servicios individuales.

---

## 6. Convenciones de naming

| Concepto | Patron | Ejemplo |
|----------|--------|---------|
| Servicio core | `{Sdk}{Responsabilidad}Service` | `FirestoreCrudService`, `StorageUploadService` |
| Servicio facade | `Firebase{Sdk}Service` | `FirebaseFirestoreService`, `FirebaseRealtimeService` |
| Repositorio feature | `{Feature}Repository` o `{Feature}RepositoryImpl` | `AuthRepository`, `UserRepositoryImpl` |
| DAO | `{Entidad}DAO` | `UserDAO` |
| DTO | `{Entidad}DTO` | `UserDTO` |
| Mapper | `{Entidad}Mapper` | `UserMapper` |
| Adapter | `{Feature}Adapter` | `AuthStorageAdapter` |
| Excepcion | `{Sdk}Exception` | `FirebaseAuthException`, `FirestoreException` |
| Error mapper | `map{Sdk}Error` | `mapFirebaseAuthError`, `mapFirestoreError` |
| Tipos | `{Sdk}Types.ts` | `FirestoreTypes.ts`, `RealtimeTypes.ts` |
| Query builder | `{sdk}QueryBuilder.ts` | `firestoreQueryBuilder.ts`, `realtimeQueryBuilder.ts` |
| Colecciones | `collections.ts` | Constantes y path builders |
| Token DI | `DI_TOKENS.{Nombre}` | `DI_TOKENS.AuthRepository`, `DI_TOKENS.LoginUseCase` |

---

## 7. Procedimiento para agregar un repositorio nuevo

1. Definir la interfaz en `domain/repository/` (ej: `IInventoryRepository`).
2. Crear la carpeta `infrastructure/firebase/features/{feature}/`.
3. Si necesita DTO, crear `{Entidad}DTO.ts` con el schema de Firestore.
4. Si necesita mapeo, crear `{Entidad}Mapper.ts` con `toDomain()` y `toDTO()`.
5. Si necesita acceso directo a coleccion, crear `{Entidad}DAO.ts`.
6. Implementar el repositorio usando servicios core o facade.
7. Agregar token en `di/tokens.ts` y registrar en `di/container.ts`.
8. Registrar la ruta de coleccion en `collections.ts` si usa Firestore.

---

# ========================================
# Arquitectura de Presentacion
# ========================================
> Estandar de desarrollo para la capa de presentacion (`presentation/`).
> Esta capa contiene la UI, navegacion, tema y componentes visuales.
> Todo archivo nuevo debe respetar las reglas aqui definidas.

---

## 1. Principios

La capa de presentacion se organiza bajo un principio de **separacion por responsabilidad**:
los componentes visuales no conocen el negocio, las pantallas orquestan la logica,
y el sistema de diseno es independiente de ambos.

Esta separacion garantiza que:
- Un componente visual se reutiliza sin arrastrar dependencias de negocio.
- Un modulo de negocio se modifica sin afectar a otros modulos.
- El sistema de diseno evoluciona sin romper pantallas existentes.

---

## 2. Glosario

**Componente**: Pieza visual reutilizable que recibe props y emite eventos.
No gestiona estado de negocio. Puede manejar estado de UI interno.
Ejemplo: `FinancifyButton`, `SimpleCard`, `AnimatedDialog`.

**Modulo de plataforma**: Pantalla que existiria en cualquier aplicacion independientemente
del dominio de negocio. La app no funciona sin ella.
Ejemplo: autenticacion, loading, no internet.

**Modulo de feature**: Pantalla que responde a un requerimiento de negocio.
Sin ella la app sigue funcionando, pero pierde funcionalidad comercial.
Ejemplo: home/dashboard, transacciones, presupuestos.

**Hook de presentacion**: Funcion React que encapsula logica de UI reutilizable.
No accede a repositorios ni UseCases.
Ejemplo: `useToggle`, `useInputTheme`.

**DependencyProvider**: Context React que expone el container DI de tsyringe
a los componentes via el hook `useDependencies()`.

---

## 3. Estructura general

```
presentation/
├── components/        Componentes visuales reutilizables — sin estado de negocio
│   ├── animated/      Animaciones (AnimatedNumber, OptimizedParticlesBackground)
│   ├── avatar/        Avatares (AvatarGroup)
│   ├── badge/         Badges (Badge, PercentageBadge)
│   ├── button/        Botones (CopyButton, FABAction, FinancifyButton)
│   ├── card/          Tarjetas (ActionCard, CompactCard, ExpandableCard, GradientCard, SimpleCard, StatsCard)
│   ├── carousel/      Carrusel (Carousel)
│   ├── chart/         Graficos (BarChart, LineChart, PieChart, ChartLegend)
│   ├── chip/          Chips (ChipGroup)
│   ├── container/     Contenedores (ThemeContainer)
│   ├── control/       Controles (Checkbox, SegmentedControl)
│   ├── dialog/        Dialogos (AnimatedDialog, ConfirmDialog, InputDialog, SelectionDialog)
│   ├── display/       Display (AmountDisplay)
│   ├── divider/       Divisores (DividerWithText)
│   ├── feedback/      Feedback (AlertBanner, EmptyState, ErrorBoundary, ErrorState, LoadingOverlay, SnackbarProvider)
│   ├── filter/        Filtros (FilterBar)
│   ├── form/          Formularios (CurrencyInput, FormikInput, FormInput, FormSection, RadioGroup, SwitchToggle, TextArea)
│   ├── gesture/       Gestos (SwipeToConfirm)
│   ├── header/        Headers (SectionHeader)
│   ├── icon/          Iconos (CategoryIcon)
│   ├── indicator/     Indicadores (StepIndicator)
│   ├── input/         Inputs especializados (MaskedInput, NumericKeypad, OTPInput, PhoneNumberInput, PINKeypad)
│   ├── list/          Listas (ListItem, SwipeableRow)
│   ├── modal/         Modales (FullScreenModal)
│   ├── navigation/    Navegacion UI (HeaderBar)
│   ├── notification/  Notificaciones (NotificationBell)
│   ├── picker/        Pickers (DatePicker, DateRangePicker, SelectorInput)
│   ├── progress/      Progreso (CircularProgressRing, ProgressBar)
│   ├── screen/        Screen utils (SmoothPopupFullScreen)
│   ├── search/        Busqueda (SearchBar)
│   ├── sheet/         Bottom sheets (FinancifyBottomSheet)
│   ├── skeleton/      Skeletons (SkeletonLoader)
│   ├── status/        Status (ConnectionStatus)
│   ├── timer/         Timers (CountdownTimer)
│   ├── tooltip/       Tooltips (InfoTip)
│   ├── transaction/   Transacciones (TransactionCard)
│   └── wrapper/       Wrappers (CreateWrappedScreen, KeyboardAvoidingWrapper, PullToRefresh, ScreenWrapper)
├── screens/           Pantallas con logica, estado y orquestacion
│   ├── platform/      Modulos de plataforma
│   │   ├── auth/      Welcome, Login, Register + components/
│   │   ├── internal/  LoadingScreen, NoInternetScreen
│   │   ├── profile/   ProfileScreen
│   │   └── dev/       ComponentPreviewScreen
│   └── features/      Modulos de feature
│       ├── home/      HomeScreen (dashboard)
│       ├── transaction/ TransactionListScreen
│       └── budget/    BudgetScreen, AssetsScreen
├── navigation/        Definicion de rutas y grafo de navegacion
│   ├── Routes.tsx     Stack navigator + Tab navigator
│   └── types.ts       RootStackParamList, TabParamList
├── theme/             Sistema de diseno (MD3 light/dark)
│   ├── ThemeProvider.tsx    Context de tema con deteccion de sistema
│   ├── materialTheme.ts     Paleta MD3 extendida (AppTheme)
│   └── colorUtils.ts        Utilidad withAlpha()
├── hooks/             Hooks de presentacion reutilizables
│   ├── useToggle.ts   Toggle booleano: [value, toggle, set]
│   └── useInputTheme.ts  Tema para TextInput labels
├── constants/         Constantes de presentacion
│   └── walletTypeCatalog.ts  Catalogo de 13 tipos de wallet
└── di/                Puente DI → React
    └── DependencyProvider.tsx  Context + useDependencies() hook
```

---

## 4. Modulos

### 4.1 components/

**Alcance**: Biblioteca de 50+ componentes visuales reutilizables.

**Contrato**:
- Reciben datos via props y emiten eventos via callbacks. No gestionan estado de negocio.
- No acceden a repositorios, UseCases ni servicios.
- Pueden manejar estado de UI interno (visibilidad, animaciones, scroll).
- Cualquier pantalla puede consumirlos sin generar acoplamiento.

**Organizacion**: Cada categoria tiene su carpeta con componentes + `index.ts` barrel export.

**Restriccion**: Si un componente necesita acceder a estado de negocio, no pertenece
a este modulo. Debe ubicarse en `screens/`.

**Convenciones de componentes**:
- `React.memo()` para memoizacion.
- `useMemo()` para estilos computados.
- `useCallback()` para handlers.
- `useTheme()` de react-native-paper para colores — nunca hardcodear.
- Props estandar: `testID`, `accessibilityLabel`, `style`.
- Named exports.
- Iconos: `MaterialCommunityIcons` con cast a `glyphMap`.

---

### 4.2 screens/

**Alcance**: Pantallas completas con logica de presentacion.
Aqui viven los formularios, las validaciones, y la composicion de componentes.

#### 4.2.1 screens/platform/ — Modulos de plataforma

| Subcarpeta | Contenido | Responsabilidad |
|------------|-----------|-----------------|
| `auth/` | WelcomeScreen, LoginScreen, RegisterScreen + components/ (PersonalInfoSection, CurrencySection) | Flujos de autenticacion: email, Google |
| `internal/` | LoadingScreen, NoInternetScreen | Pantallas de sistema (carga, sin conexion) |
| `profile/` | ProfileScreen | Gestion de perfil de usuario |
| `dev/` | ComponentPreviewScreen | Galeria de componentes para desarrollo |

#### 4.2.2 screens/features/ — Modulos de feature

Cada subcarpeta es un modulo de negocio **aislado**. Un feature no debe depender
de otro feature.

| Subcarpeta | Contenido | Responsabilidad |
|------------|-----------|-----------------|
| `home/` | HomeScreen | Dashboard principal |
| `transaction/` | TransactionListScreen | Historial de transacciones |
| `budget/` | BudgetScreen, AssetsScreen | Presupuestos y activos/pasivos |

---

### 4.3 navigation/

**Alcance**: Definicion de rutas y estructura del grafo de navegacion.

| Archivo | Responsabilidad |
|---------|-----------------|
| `Routes.tsx` | Stack navigator (auth flow) + Bottom Tab navigator (main). Logica de auth guard, animaciones por pantalla |
| `types.ts` | `RootStackParamList`: Welcome, Login, Register, Main, ComponentPreview. `TabParamList`: Home, Transactions, Budget, AssetsLiabilities, Profile |

**Flujo de navegacion**:
```
No autenticado:                    Autenticado:
Welcome → Login ↔ Register        Main (Bottom Tabs)
                                   ├── Home
                                   ├── Transactions
                                   ├── Budget
                                   ├── AssetsLiabilities
                                   └── Profile
```

**Configuracion de animaciones**:
- Auth screens: `slide_from_right` (200ms) con gesto de retorno.
- Main tabs: `none` (transicion instantanea).
- Default: `fade` (50ms).

---

### 4.4 theme/

**Alcance**: Sistema de diseno Material Design 3 con soporte light/dark.

| Archivo | Responsabilidad |
|---------|-----------------|
| `ThemeProvider.tsx` | Context React con deteccion de tema del sistema (Appearance API). Expone `isDark`, `colorScheme` via `useThemeContext()` |
| `materialTheme.ts` | Paleta MD3 completa (light + dark). Tipo `AppTheme` extiende MD3Theme con colores custom |
| `colorUtils.ts` | Utilidad `withAlpha(hexColor, opacity)`: convierte #RRGGBB a #RRGGBBAA |

**AppTheme — Colores extendidos** (ademas de MD3 estandar):

| Token | Uso |
|-------|-----|
| `success` / `onSuccess` | Estados exitosos |
| `warning` / `onWarning` | Alertas y advertencias |
| `info` / `onInfo` | Informacion contextual |
| `profit` | Ganancias en graficos financieros |
| `loss` | Perdidas en graficos financieros |
| `neutral` | Neutro en graficos financieros |

---

### 4.5 hooks/

**Alcance**: Hooks de presentacion reutilizables. Sin acceso a negocio.

| Archivo | Signature | Responsabilidad |
|---------|-----------|-----------------|
| `useToggle.ts` | `useToggle(initial): [value, toggle, set]` | Elimina patron duplicado de useState + useCallback para booleanos |
| `useInputTheme.ts` | `useInputTheme(): { colors }` | Tema compartido para labels de TextInput de react-native-paper |

---

### 4.6 constants/

| Archivo | Responsabilidad |
|---------|-----------------|
| `walletTypeCatalog.ts` | Array de 13 `WalletTypeCatalogItem` con id, value, label (espanol), description para cada tipo de wallet |

---

### 4.7 di/

| Archivo | Responsabilidad |
|---------|-----------------|
| `DependencyProvider.tsx` | Context React que wrappea el container tsyringe. Resuelve dependencias con `useMemo`. Expone `useDependencies()` hook. Define `AppDependencies` interface |

**AppDependencies** (expuestas al arbol React):
```typescript
interface AppDependencies {
  // Repositorios
  authRepository: IAuthRepository;
  authStateRepository: IAuthStateRepository;
  authStorageRepository: IAuthStorageRepository;
  googleAuthRepository: IGoogleAuthRepository;
  networkRepository: INetworkRepository;
  // UseCases
  loginUseCase: LoginUseCase;
  loginWithGoogleUseCase: LoginWithGoogleUseCase;
  logoutUseCase: LogoutUseCase;
  registerUserUseCase: RegisterUserUseCase;
}
```

---

### 4.8 App Entry Point (`App.tsx`)

**Jerarquia de providers** (de exterior a interior):

```
GestureHandlerRootView      — Deteccion de gestos
  SafeAreaProvider           — Manejo de notch/safe areas
    DependencyProvider       — IoC container (tsyringe → React Context)
      ThemeProvider           — Deteccion de tema del sistema (light/dark)
        PaperProvider          — Material Design 3 theme
          NavigationContainer   — React Navigation
            SnackbarProvider     — Notificaciones globales
              Routes              — Stack + Tab navigators
```

---

## 5. Reglas

### 5.1 Regla de ubicacion

| Gestiona estado de negocio? | Cuantos modulos lo consumen? | Destino |
|:---:|:---:|---|
| No | Cualquiera | `components/` |
| Si | 1 modulo | Dentro de su `screens/platform/` o `screens/features/` |
| Si | 2+ modulos | `screens/shared/` (crear bajo demanda) |

### 5.2 Regla de dependencias

Cada modulo solo puede depender de los modulos con nivel inferior o igual al suyo.

```
Nivel 0    theme                No depende de ningun otro modulo de presentation
Nivel 1    components           Solo depende de theme
Nivel 2    screens              Depende de components, theme y constantes de navigation
Nivel 2    navigation           Depende de screens (registra pantallas) y components
```

**Dependencias prohibidas**:
- `components` → `screens` — Invierte la jerarquia.
- `theme` → cualquier otro modulo — El sistema de diseno debe ser autonomo.
- `features/X` → `features/Y` — Cada feature es independiente.

### 5.3 Regla de aislamiento de features

Los modulos de feature son independientes entre si. No deben importarse mutuamente.
Si surge necesidad de compartir:

| Tipo de elemento compartido | Accion |
|------------------------------|--------|
| Componente visual sin logica | Mover a `components/` |
| Componente con logica de negocio | Mover a `screens/shared/` |
| Modelo de dominio | Vive en la capa de dominio, no en presentation |

### 5.4 Regla de performance

Todos los componentes y pantallas siguen estas convenciones de rendimiento:
- `React.memo()` en componentes funcionales puros.
- `useMemo()` para objetos de estilo y datos computados (dependency array explicito).
- `useCallback()` para handlers (dependency array explicito).
- `useTheme()` para colores — nunca valores hardcoded.
- Estilos memoizados con `useMemo` en vez de `StyleSheet.create` cuando dependen del tema.

### 5.5 Regla de internacionalizacion

- Idioma primario: Espanol (es-PE).
- Todos los textos en espanol.
- Formato de fechas: `toLocaleDateString("es-PE", ...)`.
- Sin libreria i18n por ahora — strings hardcoded.

---

## 6. Convenciones de naming

| Concepto | Patron | Ejemplo |
|----------|--------|---------|
| Pantalla | `{Nombre}Screen` | `LoginScreen`, `HomeScreen` |
| Componente reutilizable | Nombre descriptivo | `FinancifyButton`, `AnimatedDialog` |
| Variantes de componente | Prefijo descriptivo | `SimpleCard`, `ExpandableCard`, `GradientCard` |
| Sub-componente de pantalla | `{Aspecto}Section` | `PersonalInfoSection`, `CurrencySection` |
| Hook de UI | `use{Proposito}` | `useToggle`, `useInputTheme` |
| Constantes | `{nombre}Catalog` o descriptivo | `walletTypeCatalog` |
| Barrel export | `index.ts` por carpeta | `components/card/index.ts` |
| Tipos de navegacion | `{Scope}ParamList` | `RootStackParamList`, `TabParamList` |

---

## 7. Procedimiento para agregar un feature nuevo

1. Crear la carpeta `screens/features/{nombre}/`.
2. Crear la pantalla principal `{Nombre}Screen.tsx`.
3. Si necesita sub-componentes, crearlos en `components/` dentro del modulo.
4. Registrar la ruta en `navigation/types.ts` y `navigation/Routes.tsx`.
5. Verificar que el modulo no importe ningun otro feature.
6. Si necesita logica compartida, extraerla a `screens/shared/`.

## 8. Procedimiento para agregar un componente nuevo

1. Identificar la categoria correcta en `components/` (button, card, dialog, form, etc.).
2. Crear el archivo en `components/{categoria}/{Nombre}.tsx`.
3. Usar `React.memo()`, `useTheme()`, `useMemo()` para estilos.
4. Incluir props `testID` y `accessibilityLabel`.
5. Exportar desde `components/{categoria}/index.ts`.
6. Si el componente gestiona estado de negocio, no pertenece aqui — va en `screens/`.
