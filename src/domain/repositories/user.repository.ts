import { User } from '@prisma/client';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

export interface IUserRepository {
  create(data: CreateUserDto): Promise<User | null>;
  findById(id: number): Promise<User | null>;
}
