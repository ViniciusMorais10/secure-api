import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      userId: number;
      email: string;
      role: Role;
    }
  }
}

export {};
