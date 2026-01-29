import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) { }

  async findByEmailWithPassword(mail: string) {
    const normalizedEmail = this.normalizedEmail(mail);
    return await this.prismaService.user.findUnique({
      where: { email: normalizedEmail },
    });
  }

  async findByEmail(mail: string) {
    const normalizedEmail = this.normalizedEmail(mail);
    return await this.prismaService.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async create(data: CreateUserDto) {
    const email = this.normalizedEmail(data.email);
    const createdData = { ...data, email };

    const userExists = await this.findByEmailWithPassword(email);

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prismaService.user.create({
      data: createdData,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findById(id: number) {
    return await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  private normalizedEmail(email: string) {
    const emailNormalized = email.trim().toLowerCase();
    return emailNormalized;
  }
}
