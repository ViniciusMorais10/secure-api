import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

const WINDOW_MINUTES = 15;
const MAX_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

@Injectable()
export class LoginAttemptService {
  constructor(private readonly prismaService: PrismaService) {}

  async assertNoLocked(email: string, ip: string): Promise<void> {
    const attempt = await this.prismaService.loginAttempt.findUnique({
      where: { email_ip: { email, ip } },
    });

    if (!attempt?.lockedUntil) return;

    const now = new Date();

    if (attempt.lockedUntil > now) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async recordFailure(email: string, ip: string) {
    const attempt = await this.prismaService.loginAttempt.findUnique({
      where: { email_ip: { email, ip } },
    });

    const windowExpired = attempt?.firstAttemptAt
      ? addMinutes(attempt.firstAttemptAt, WINDOW_MINUTES) < new Date()
      : false;

    if (!attempt) {
      await this.prismaService.loginAttempt.create({
        data: {
          email,
          ip,
          count: 1,
          firstAttemptAt: new Date(),
        },
      });
    } else if (windowExpired) {
      await this.prismaService.loginAttempt.update({
        where: { email_ip: { email, ip } },
        data: {
          count: 1,
          firstAttemptAt: new Date(),
          lockedUntil: null,
        },
      });
    } else {
      await this.prismaService.loginAttempt.update({
        where: { email_ip: { email, ip } },
        data: {
          count: attempt.count + 1,
          firstAttemptAt: new Date(),
        },
      });
    }
  }

  async reset() {}
}
