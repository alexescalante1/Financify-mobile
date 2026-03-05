// Rutas centralizadas de colecciones Firestore
// Equivalente a FirestoreCollections en la arquitectura Kotlin

export const FirestoreCollections = {
  USERS: 'users',

  // Subcolecciones de usuario
  userWallets: (userId: string) => `users/${userId}/Wallets`,
  userTransactions: (userId: string) => `users/${userId}/transactions`,

  // Documentos especificos
  userDoc: (userId: string) => `users/${userId}`,
  walletDoc: (userId: string, walletId: string) =>
    `users/${userId}/Wallets/${walletId}`,
  transactionDoc: (userId: string, transactionId: string) =>
    `users/${userId}/transactions/${transactionId}`,
} as const;
