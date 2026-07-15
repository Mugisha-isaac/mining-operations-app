import { Column, Entity, Index } from 'typeorm';
import { Role } from '@minetech/common';
import { TenantScopedEntity } from '@minetech/common';

@Entity('users')
@Index(['tenantId', 'email'], { unique: true })
export class User extends TenantScopedEntity {
  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: Role, default: Role.SUPERVISOR })
  role: Role;
}
