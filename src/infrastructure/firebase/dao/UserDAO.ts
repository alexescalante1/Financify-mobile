import { injectable, inject } from "tsyringe";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/infrastructure/firebase/FirebaseConfiguration";
import { UserDTO } from "../dto/UserDTO";

/**
 * DAO para operaciones CRUD de User en Firestore
 * Capa de acceso a datos que interactúa directamente con Firestore
 * Colección: 'users'
 */
@injectable()
export class UserDAO {
  private readonly collectionName = "users";

  /**
   * Crea un nuevo usuario en Firestore
   */
  async create(userDTO: UserDTO): Promise<void> {
    const userRef = doc(db, this.collectionName, userDTO.id);
    await setDoc(userRef, userDTO);
  }

  /**
   * Obtiene un usuario por ID
   */
  async getById(userId: string): Promise<UserDTO | null> {
    const userRef = doc(db, this.collectionName, userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return userSnap.data() as UserDTO;
  }

  /**
   * Actualiza un usuario existente
   */
  async update(userId: string, updates: Partial<UserDTO>): Promise<void> {
    const userRef = doc(db, this.collectionName, userId);

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
    const userRef = doc(db, this.collectionName, userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  }
}
