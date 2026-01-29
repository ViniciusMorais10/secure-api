import { Role } from '@prisma/client';

export type RequestUser = {
  userId: number;
  email: string;
  role: Role;
};
