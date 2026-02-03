import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { LoginAttemptService } from './login-attempt.service';
import { AuditLogModule } from 'src/audit/audit-log.module';

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [LoginAttemptService],
  exports: [LoginAttemptService],
})
export class LoginAttemptModule {}
