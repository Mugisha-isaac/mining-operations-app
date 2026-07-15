import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { TenantScopedEntity, ShiftStatus } from '@minetech/common';
import { Worker } from './worker.entity';

@Entity('shifts')
@Index(['tenantId', 'status'])
export class Shift extends TenantScopedEntity {
  @Column()
  workerId: string;

  @ManyToOne(() => Worker, (worker) => worker.shifts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workerId' })
  worker: Worker;

  @Column({ type: 'enum', enum: ShiftStatus, default: ShiftStatus.ON_SHIFT })
  status: ShiftStatus;

  @Column({ type: 'timestamptz' })
  checkInAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  checkOutAt: Date | null;
}
