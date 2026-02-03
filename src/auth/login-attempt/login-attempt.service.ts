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

  async assertNotLocked(email: string, ip: string): Promise<void> {
    const attempt = await this.prismaService.loginAttempt.findUnique({
      where: { email_ip: { email, ip } },
    });

    if (!attempt?.lockedUntil) return;

    const now = new Date();

    if (attempt.lockedUntil > now) {
      throw new UnauthorizedException('Invalid credentials');
    }

    //keep state clean
    await this.prismaService.loginAttempt.update({
      where: { email_ip: { email, ip } },
      data: {
        lockedUntil: null,
        count: 0,
        firstAttemptAt: now,
      },
    });
  }

  async recordFailure(email: string, ip: string) {
    const now = new Date();

    const attempt = await this.prismaService.loginAttempt.findUnique({
      where: { email_ip: { email, ip } },
    });

    if (!attempt) {
      await this.prismaService.loginAttempt.create({
        data: {
          email,
          ip,
          count: 1,
          firstAttemptAt: now,
          lockedUntil: null,
        },
      });
      return;
    }

    if (attempt.lockedUntil && attempt.lockedUntil > now) {
      return;
    }

    const windowEndsAt = addMinutes(attempt.firstAttemptAt, WINDOW_MINUTES);
    const windowExpired = windowEndsAt < now;

    if (windowExpired) {
      await this.prismaService.loginAttempt.update({
        where: { email_ip: { email, ip } },
        data: {
          count: 1,
          firstAttemptAt: now,
          lockedUntil: null,
        },
      });
    }

    const nextCount = attempt.count + 1;
    const shoudLock = nextCount >= MAX_ATTEMPTS;

    await this.prismaService.loginAttempt.update({
      where: { email_ip: { email, ip } },
      data: {
        count: nextCount,
        firstAttemptAt: attempt.firstAttemptAt,
        lockedUntil: shoudLock ? addMinutes(now, LOCK_MINUTES) : null,
      },
    });
  }

  async reset(email: string, ip: string): Promise<void> {
    const now = new Date();

    const attempt = await this.prismaService.loginAttempt.findUnique({
      where: { email_ip: { email, ip } },
    });

    if (!attempt) return;

    await this.prismaService.loginAttempt.update({
      where: { email_ip: { email, ip } },
      data: {
        count: 0,
        firstAttemptAt: now,
        lockedUntil: null,
      },
    });
  }
}
