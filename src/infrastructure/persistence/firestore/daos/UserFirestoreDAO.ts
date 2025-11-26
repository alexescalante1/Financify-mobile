import { injectable } from "tsyringe";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/infrastructure/firebase/FirebaseConfiguration";
import { UserFirestoreDTO } from "../dtos/UserFirestoreDTO";

/**
 * DAO para operaciones de persistencia de User en Firestore
 * Responsabilidad única: CRUD en la colección 'users'
 */
@injectable()
export class UserFirestoreDAO {
  private readonly COLLECTION_NAME = "users";

  /**
   * Guarda un usuario en Firestore
   */
  async save(userDTO: UserFirestoreDTO): Promise<void> {
    const userRef = doc(db, this.COLLECTION_NAME, userDTO.id);
    await setDoc(userRef, userDTO);
  }

  /**
   * Busca un usuario por ID
   */
  async findById(userId: string): Promise<UserFirestoreDTO | null> {
    const userRef = doc(db, this.COLLECTION_NAME, userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as UserFirestoreDTO;
  }

  /**
   * Actualiza un usuario
   */
  async update(userId: string, updates: Partial<UserFirestoreDTO>): Promise<void> {
    const userRef = doc(db, this.COLLECTION_NAME, userId);

    const updateData = {
      ...updates,
      "metadata.updatedAt": new Date().toISOString(),
    };

    await updateDoc(userRef, updateData);
  }

  /**
   * Verifica si un usuario existe
   */
  async exists(userId: string): Promise<boolean> {
    const userRef = doc(db, this.COLLECTION_NAME, userId);
    const snapshot = await getDoc(userRef);
    return snapshot.exists();
  }
}
