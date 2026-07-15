import { Column, Entity, Index, OneToMany } from 'typeorm';
import { TenantScopedEntity } from '@minetech/common';
import { Shift } from './shift.entity';

@Entity('workers')
@Index(['tenantId'])
export class Worker extends TenantScopedEntity {
  @Column()
  fullName: string;

  @Column({ nullable: true })
  role: string;

  @Column({ unique: true })
  employeeCode: string;

  @OneToMany(() => Shift, (shift) => shift.worker)
  shifts: Shift[];
}
