# Financify - Arquitectura Clean Architecture & SOLID

## Estructura de Capas (Onion Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ RegisterScreen.tsx                                      │ │
│  │ - UI Components                                         │ │
│  │ - Formularios con validación                            │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ useAuth Hook                                            │ │
│  │ - Gestiona estado de autenticación                      │ │
│  │ - Llama a Use Cases                                     │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │ RegisterUserUseCase                                     │ │
│  │ - Lógica de negocio de registro                         │ │
│  │ - Coordina Repositories                                 │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Entities (User, Wallet)                                 │ │
│  │ - Lógica de negocio pura                                │ │
│  │ - No dependen de nada                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Interfaces (IAuthRepository, IWalletRepository)         │ │
│  │ - Contratos para infraestructura                        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Value Objects (UserRegistrationVo)                      │ │
│  │ - Objetos de valor inmutables                           │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Repositories (AuthRepository, WalletRepository)         │ │
│  │ - Implementan interfaces del dominio                    │ │
│  │ - Usan DAOs y Mappers                                   │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │ DAOs (UserDAO, WalletDAO)                               │ │
│  │ - Acceso directo a Firestore                            │ │
│  │ - CRUD básico                                           │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │ DTOs (UserDTO, WalletDTO)                               │ │
│  │ - Estructura de datos de Firestore                      │ │
│  └────────────────────┬───────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼───────────────────────────────────┐ │
│  │ Mappers (UserMapper, WalletMapper)                      │ │
│  │ - Transforman Entity <-> DTO                            │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## Flujo de Registro de Usuario

```
RegisterScreen.tsx
    │
    │ 1. Usuario completa formulario
    │
    ▼
useAuth.register()
    │
    │ 2. Llama al Use Case
    │
    ▼
RegisterUserUseCase.execute()
    │
    ├──► 3. Crea usuario
    │    AuthRepository.register()
    │        │
    │        ├──► Firebase Auth (createUserWithEmailAndPassword)
    │        │
    │        ├──► UserMapper.toDTO()
    │        │
    │        └──► UserDAO.create() → Firestore users/{userId}
    │
    └──► 4. Crea wallet por defecto
         WalletRepository.register()
             │
             ├──► WalletDAO.getNextId()
             │
             ├──► WalletMapper.toDTO()
             │
             └──► WalletDAO.create() → Firestore users/{userId}/Wallets/{walletId}
```

## Principios SOLID Aplicados

### 1. Single Responsibility Principle (SRP)
- **DAOs**: Solo acceso a datos (CRUD en Firestore)
- **Mappers**: Solo transformación de datos
- **Repositories**: Coordinan DAOs y Mappers
- **Use Cases**: Lógica de negocio específica
- **Hooks**: Gestión de estado de UI

### 2. Open/Closed Principle (OCP)
- Interfaces en dominio permiten extensión sin modificación
- Nuevas implementaciones de repositorios sin cambiar dominio

### 3. Liskov Substitution Principle (LSP)
- Cualquier implementación de `IAuthRepository` funciona
- Cualquier implementación de `IWalletRepository` funciona

### 4. Interface Segregation Principle (ISP)
- Interfaces específicas por funcionalidad
- No interfaces gordas con métodos no usados

### 5. Dependency Inversion Principle (DIP)
- Capas superiores dependen de abstracciones (interfaces)
- Inyección de dependencias con tsyringe
- Infraestructura depende de dominio, no al revés

## Estructura de Archivos

```
src/
├── domain/
│   ├── entities/
│   │   ├── User.ts                    # Entidad de dominio
│   │   └── Wallet.ts                  # Entidad de dominio
│   ├── interfaces/
│   │   └── repository/
│   │       ├── IUserRepository.ts     # Contrato
│   │       └── IWalletRepository.ts   # Contrato
│   └── valueObjects/
│       └── UserRegistrationVo.ts      # Value Object
│
├── application/
│   ├── useCases/
│   │   └── auth/
│   │       └── RegisterUserUseCase.ts # Lógica de negocio
│   └── hooks/
│       └── useAuth.ts                 # Estado de UI
│
├── infrastructure/
│   ├── firebase/
│   │   ├── dao/
│   │   │   ├── UserDAO.ts             # Acceso a datos
│   │   │   └── WalletDAO.ts           # Acceso a datos
│   │   ├── dto/
│   │   │   ├── UserDTO.ts             # Estructura Firestore
│   │   │   └── WalletDTO.ts           # Estructura Firestore
│   │   ├── mappers/
│   │   │   ├── UserMapper.ts          # Entity <-> DTO
│   │   │   └── WalletMapper.ts        # Entity <-> DTO
│   │   └── repository/
│   │       ├── auth/
│   │       │   └── AuthRepository.ts  # Implementación
│   │       └── WalletRepository.refactored.ts # Implementación
│   └── di/
│       └── firebase.repository.ts     # Registro DI
│
└── presentation/
    └── screens/
        └── Internal/
            └── start/
                └── RegisterScreen.tsx  # UI
```

## Beneficios de la Arquitectura

### 1. Testabilidad
- Cada capa puede probarse independientemente
- Mocks fáciles con interfaces
- Use Cases aislados

### 2. Mantenibilidad
- Separación de responsabilidades clara
- Cambios localizados
- Código más legible

### 3. Escalabilidad
- Fácil agregar nuevas funcionalidades
- Nuevas implementaciones (ej: cambiar Firestore por otra BD)
- Reutilización de código

### 4. Independencia de Frameworks
- Dominio puro (sin dependencias externas)
- Infraestructura intercambiable
- Migración facilitada

## Próximos Pasos

1. **Implementar casos de uso restantes**:
   - LoginUserUseCase
   - UpdateUserUseCase
   - CreateWalletUseCase

2. **Agregar validaciones de dominio**:
   - Validar reglas de negocio en entidades
   - Value Objects con validación

3. **Implementar Event Sourcing** (opcional):
   - Eventos de dominio
   - Event Bus

4. **Testing**:
   - Unit tests para Use Cases
   - Integration tests para Repositories
   - E2E tests para flujos completos
