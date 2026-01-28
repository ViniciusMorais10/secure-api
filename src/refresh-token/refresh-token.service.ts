import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userId: number, refreshToken: string, expiresAt: Date) {
    const tokenHash = await argon2.hash(refreshToken);

    return await this.prismaService.refreshToken.create({
      data: {
        userId: userId,
        tokenHash,
        expiresAt,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        revokedAt: true,
        createdAt: true,
      },
    });
  }

  async findValidByUser(userId: number) {
    return await this.prismaService.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async revoke(tokenId: string) {
    return await this.prismaService.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
      select: {
        id: true,
        revokedAt: true,
      },
    });
  }

  async findMatchingToken(userId: number, refreshToken: string) {
    const tokens = await this.findValidByUser(userId);

    for (const token of tokens) {
      const matches = await argon2.verify(token.tokenHash, refreshToken);
      if (matches) {
        return token;
      }
    }
    return null;
  }
}
