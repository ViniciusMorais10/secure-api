import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async register(data: CreateUserDto) {
    const { email, password } = data;

    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.prismaService.user.create({
      data: {
        email,
        password: passwordHash,
        status: true,
      },
    });

    return {
      id: user.id,
      email,
    };
  }
}
