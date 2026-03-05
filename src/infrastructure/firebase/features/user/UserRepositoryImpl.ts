import { injectable } from 'tsyringe';
import { IUserRepository } from '@/domain/repository/IUserRepository';
import { User } from '@/domain/entities/User';
import { UserUpdateVo } from '@/domain/valueObjects/UserUpdateVo';
import { UserDAO } from './UserDAO';
import { UserMapper } from './UserMapper';

@injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly userDAO: UserDAO) {}

  async save(user: User): Promise<void> {
    const userDTO = UserMapper.toDTO(user);
    await this.userDAO.create(userDTO);
  }

  async findById(userId: string): Promise<User | null> {
    const userDTO = await this.userDAO.getById(userId);
    return userDTO ? UserMapper.toDomain(userDTO) : null;
  }

  async update(userId: string, updates: UserUpdateVo): Promise<void> {
    const partialDTO = UserMapper.toPartialDTO(updates);
    await this.userDAO.update(userId, partialDTO);
  }

  async exists(userId: string): Promise<boolean> {
    return this.userDAO.exists(userId);
  }
}
