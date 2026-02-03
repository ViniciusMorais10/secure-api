import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoginAttemptService } from './login-attempt.service';

@Module({
  imports: [PrismaModule],
  providers: [LoginAttemptService],
  exports: [LoginAttemptService],
})
export class LoginAttemptModule {}
