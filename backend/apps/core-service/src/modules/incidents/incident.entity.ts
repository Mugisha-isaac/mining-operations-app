import { Column, Entity, Index } from 'typeorm';
import { TenantScopedEntity, IncidentStatus } from '@minetech/common';

@Entity('incidents')
@Index(['tenantId', 'status'])
export class Incident extends TenantScopedEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  location: string;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.REPORTED })
  status: IncidentStatus;

  @Column()
  photoObjectKey: string;

  @Column()
  reportedByUserId: string;

  @Column()
  reportedByEmail: string;

  @Column({ type: 'uuid', nullable: true })
  workerId: string | null;
}