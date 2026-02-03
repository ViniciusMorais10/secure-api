import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLogDto } from './create-log.dto';

@Injectable()
export class AuditLogService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateLogDto) {
    return this.prismaService.auditLog.create({
      data,
    });
  }
}
