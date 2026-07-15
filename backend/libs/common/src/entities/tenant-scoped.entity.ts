import {
  Column,
  CreateDateColumn,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Every tenant-owned table extends this. `tenantId` is indexed and every
 * repository query in the app MUST filter by it (see TenantScopedRepository
 * in each module's service) - a query without this filter is a data leak
 * per the CTO's brief.
 */
export abstract class TenantScopedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  tenantId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}