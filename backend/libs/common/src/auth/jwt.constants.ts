import { Role } from '../enums/role.enum';

export const JWT_EXPIRES_IN = '8h';

/** Shape of the token payload every service agrees on. */
export interface JwtPayload {
  sub: string; // user id
  tenantId: string;
  role: Role;
  email: string;
}

export interface AuthenticatedUser {
  userId: string;
  tenantId: string;
  role: Role;
  email: string;
}
