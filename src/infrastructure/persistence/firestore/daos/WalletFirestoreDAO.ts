import { injectable } from "tsyringe";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
  where,
} from "firebase/firestore";
import { db } from "@/infrastructure/firebase/FirebaseConfiguration";
import { WalletFirestoreDTO } from "../dtos/WalletFirestoreDTO";

/**
 * DAO para operaciones de persistencia de Wallet en Firestore
 * Responsabilidad única: CRUD en la subcolección 'users/{userId}/Wallets'
 */
@injectable()
export class WalletFirestoreDAO {
  private readonly SUBCOLLECTION_NAME = "Wallets";

  /**
   * Obtiene la ruta de la subcolección de wallets
   */
  private getCollectionPath(userId: string): string {
    return `users/${userId}/${this.SUBCOLLECTION_NAME}`;
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

    const lastWallet = snapshot.docs[0].data() as WalletFirestoreDTO;
    return (lastWallet.id || 0) + 1;
  }

  /**
   * Guarda una wallet en Firestore
   */
  async save(userId: string, walletDTO: WalletFirestoreDTO): Promise<void> {
    const walletRef = doc(
      db,
      this.getCollectionPath(userId),
      walletDTO.id.toString()
    );
    await setDoc(walletRef, walletDTO);
  }

  /**
   * Busca una wallet por ID
   */
  async findById(userId: string, walletId: number): Promise<WalletFirestoreDTO | null> {
    const walletRef = doc(
      db,
      this.getCollectionPath(userId),
      walletId.toString()
    );
    const snapshot = await getDoc(walletRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as WalletFirestoreDTO;
  }

  /**
   * Obtiene todas las wallets de un usuario
   */
  async findAll(userId: string): Promise<WalletFirestoreDTO[]> {
    const collectionRef = collection(db, this.getCollectionPath(userId));
    const q = query(collectionRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => doc.data() as WalletFirestoreDTO);
  }

  /**
   * Obtiene la wallet primaria de un usuario
   */
  async findPrimary(userId: string): Promise<WalletFirestoreDTO | null> {
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

    return snapshot.docs[0].data() as WalletFirestoreDTO;
  }
}
