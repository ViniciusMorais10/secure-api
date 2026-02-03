import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as argon2 from 'argon2';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { ConfigService } from '@nestjs/config';

import type { StringValue } from 'ms';
import { RefreshDto } from './dto/refresh.dto';
import { LoginAttemptService } from './login-attempt/login-attempt.service';

export interface RefreshTokenPayload {
  sub: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly refreshService: RefreshTokenService,
    private readonly logingAttemptService: LoginAttemptService,
  ) {}

  async register(data: CreateUserDto) {
    const { email, password } = data;

    const passwordHash = await argon2.hash(password);

    const user = await this.userService.create({
      email,
      password: passwordHash,
    });

    return {
      id: user.id,
      email: user.email,
    };
  }

  async login(data: LoginDto, ip: string) {
    const email = data.email.trim().toLowerCase();
    const { password } = data;

    await this.logingAttemptService.assertNotLocked(email, ip);

    const user = await this.userService.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.status) {
      throw new UnauthorizedException('Account is inactive');
    }

    const passwordMatches = await argon2.verify(user.password, password);

    if (!passwordMatches) {
      await this.logingAttemptService.recordFailure(email, ip);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.logingAttemptService.reset(email, ip);

    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');
    const accessExpiresIn =
      (this.config.get<string>('JWT_ACCESS_EXPIRES_IN') as StringValue) ??
      '15m';

    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const refreshExpiresIn =
      (this.config.get<string>('JWT_REFRESH_EXPIRES_IN') as StringValue) ??
      '7d';
    if (!accessSecret) throw new Error('JWT_ACCESS_SECRET is not set');
    if (!refreshSecret) throw new Error('JWT_REFRESH_SECRET is not set');

    const accessPayload = { sub: user.id, email: user.email, role: user.role };
    const refreshPayload = { sub: user.id };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    const refreshExpiresAt = this.computeExpiresAt(refreshExpiresIn);

    await this.refreshService.create(user.id, refreshToken, refreshExpiresAt);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: RefreshDto) {
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const refreshExpiresIn = this.config.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const accessSecret = this.config.get<string>('JWT_ACCESS_SECRET');
    const accessExpiresIn = this.config.get<string>(
      'JWT_ACCESS_EXPIRES_IN',
      '15m',
    );

    if (!refreshSecret || !accessSecret) throw new Error('JWT secrets not set');

    let payload: RefreshTokenPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken.refreshToken,
        {
          secret: refreshSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }

    const userId = payload.sub;

    const matchedSession = await this.refreshService.findMatchingToken(
      userId,
      refreshToken.refreshToken,
    );

    if (!matchedSession) {
      throw new UnauthorizedException('Unauthorized');
    }

    //revogacao
    await this.refreshService.revoke(matchedSession.id);

    const user = await this.userService.findById(userId);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const accessPayload = { sub: user.id, email: user.email, role: user.role };
    const refreshPayload = { sub: user.id };

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as StringValue,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as StringValue,
      }),
    ]);

    const refreshExpiresAt = this.computeExpiresAt(refreshExpiresIn);

    await this.refreshService.create(
      user.id,
      newRefreshToken,
      refreshExpiresAt,
    );

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  private computeExpiresAt(expiresIn: string): Date {
    const match = /^(\d+)([smhd])$/.exec(expiresIn.trim());
    if (!match) {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
    const value = Number(match[1]);
    const unit = match[2];
    const ms =
      unit === 's'
        ? value * 1000
        : unit === 'm'
          ? value * 60 * 1000
          : unit === 'h'
            ? value * 60 * 60 * 1000
            : value * 24 * 60 * 60 * 1000;
    return new Date(Date.now() + ms);
  }
}
