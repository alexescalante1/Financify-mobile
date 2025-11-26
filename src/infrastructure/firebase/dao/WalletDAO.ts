import { injectable, inject } from "tsyringe";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  updateDoc,
  where,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase/FirebaseConfiguration";
import { WalletDTO } from "../dto/WalletDTO";

/**
 * DAO para operaciones CRUD de Wallet en Firestore
 * Capa de acceso a datos que interactúa directamente con Firestore
 * Subcolección: 'users/{userId}/Wallets'
 */
@injectable()
export class WalletDAO {
  /**
   * Obtiene el nombre de la subcolección para un usuario específico
   */
  private getCollectionPath(userId: string): string {
    return `users/${userId}/Wallets`;
  }

  /**
   * Obtiene el siguiente ID disponible para una wallet
   */
  async getNextId(userId: string): Promise<number> {
    const collectionRef = collection(db, this.getCollectionPath(userId));
    const q = query(collectionRef, orderBy("id", "desc"), firestoreLimit(1));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return 1;
    }

    const lastWallet = snapshot.docs[0].data() as WalletDTO;
    return (lastWallet.id || 0) + 1;
  }

  /**
   * Crea una nueva wallet en Firestore
   */
  async create(userId: string, walletDTO: WalletDTO): Promise<void> {
    const walletRef = doc(
      db,
      this.getCollectionPath(userId),
      walletDTO.id.toString()
    );
    await setDoc(walletRef, walletDTO);
  }

  /**
   * Obtiene una wallet por ID
   */
  async getById(userId: string, walletId: number): Promise<WalletDTO | null> {
    const walletRef = doc(
      db,
      this.getCollectionPath(userId),
      walletId.toString()
    );
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      return null;
    }

    return walletSnap.data() as WalletDTO;
  }

  /**
   * Obtiene todas las wallets de un usuario
   */
  async getAll(userId: string): Promise<WalletDTO[]> {
    const collectionRef = collection(db, this.getCollectionPath(userId));
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data() as WalletDTO);
  }

  /**
   * Obtiene la wallet primaria de un usuario
   */
  async getPrimary(userId: string): Promise<WalletDTO | null> {
    const collectionRef = collection(db, this.getCollectionPath(userId));
    const q = query(
      collectionRef,
      where("isPrimary", "==", true),
      firestoreLimit(1)
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    return snapshot.docs[0].data() as WalletDTO;
  }

  /**
   * Actualiza una wallet existente
   */
  async update(
    userId: string,
    walletId: number,
    updates: Partial<WalletDTO>
  ): Promise<void> {
    const walletRef = doc(
      db,
      this.getCollectionPath(userId),
      walletId.toString()
    );
    await updateDoc(walletRef, updates as any);
  }

  /**
   * Elimina una wallet
   */
  async delete(userId: string, walletId: number): Promise<void> {
    const walletRef = doc(
      db,
      this.getCollectionPath(userId),
      walletId.toString()
    );
    await deleteDoc(walletRef);
  }

  /**
   * Desmarca todas las wallets como primarias
   */
  async unmarkAllPrimary(userId: string): Promise<void> {
    const wallets = await this.getAll(userId);

    const updates = wallets.map((wallet) =>
      this.update(userId, wallet.id, { isPrimary: false })
    );

    await Promise.all(updates);
  }

  /**
   * Verifica si existe una wallet
   */
  async exists(userId: string, walletId: number): Promise<boolean> {
    const walletRef = doc(
      db,
      this.getCollectionPath(userId),
      walletId.toString()
    );
    const walletSnap = await getDoc(walletRef);
    return walletSnap.exists();
  }
}
