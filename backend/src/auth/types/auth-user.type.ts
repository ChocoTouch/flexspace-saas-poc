import { User, Role } from '@prisma/client';

export type AuthUser = Omit<User, 'password'> & {
  role: Role;
};
