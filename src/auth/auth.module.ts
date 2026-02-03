import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenModule } from '../refresh-token/refresh-token.module';
import { JwtStrategy } from './strategies/jwt.strategy';

import { LoginAttemptModule } from './login-attempt/login-attempt.module';
import { AuditLogModule } from '../audit/audit-log.module';

@Module({
  imports: [
    UserModule,
    RefreshTokenModule,
    LoginAttemptModule,
    AuditLogModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
