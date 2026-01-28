import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}
  async findByEmail(mail: string) {
    mail = this.normalizedEmail(mail);
    const user = await this.prismaService.user.findUnique({
      where: {
        email: mail,
      },
    });

    return user;
  }

  async create(data: CreateUserDto) {
    const email = this.normalizedEmail(data.email);
    const createdData = { ...data, email };
    const userExists = await this.findByEmail(email);

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prismaService.user.create({
      data: createdData,
    });

    return user;
  }

  private normalizedEmail(email: string) {
    const emailNormalized = email.trim().toLowerCase();
    return emailNormalized;
  }
}
