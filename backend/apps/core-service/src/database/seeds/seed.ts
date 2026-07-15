import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { Tenant } from '../../modules/tenants/tenant.entity';
import { User } from '../../modules/users/user.entity';
import { Worker } from '../../modules/workers/worker.entity';
import { Role } from '@minetech/common';

async function seed() {
  await AppDataSource.initialize();

  const tenantRepo = AppDataSource.getRepository(Tenant);
  const userRepo = AppDataSource.getRepository(User);
  const workerRepo = AppDataSource.getRepository(Worker);

  let tenant = await tenantRepo.findOne({ where: { slug: 'kivu-mine' } });
  if (!tenant) {
    tenant = await tenantRepo.save(tenantRepo.create({ name: 'Kivu Mine Site', slug: 'kivu-mine' }));
    console.log(`Created tenant ${tenant.name} (${tenant.id})`);
  }

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const usersToSeed = [
    { email: 'admin@minetech.rw', fullName: 'Aline Admin', role: Role.ADMIN },
    { email: 'supervisor@minetech.rw', fullName: 'Sam Supervisor', role: Role.SUPERVISOR },
  ];

  for (const u of usersToSeed) {
    const existing = await userRepo.findOne({ where: { tenantId: tenant.id, email: u.email } });
    if (!existing) {
      await userRepo.save(
        userRepo.create({ ...u, tenantId: tenant.id, passwordHash }),
      );
      console.log(`Seeded user ${u.email} / Password123!`);
    }
  }

  const workersToSeed = [
    { fullName: 'Jean Bosco', employeeCode: 'W-001', role: 'Driller' },
    { fullName: 'Marie Uwase', employeeCode: 'W-002', role: 'Loader Operator' },
    { fullName: 'Eric Habimana', employeeCode: 'W-003', role: 'Safety Officer' },
  ];

  for (const w of workersToSeed) {
    const existing = await workerRepo.findOne({ where: { employeeCode: w.employeeCode } });
    if (!existing) {
      await workerRepo.save(workerRepo.create({ ...w, tenantId: tenant.id }));
      console.log(`Seeded worker ${w.fullName}`);
    }
  }

  console.log('\nSeed complete. Login with:');
  console.log('  admin@minetech.rw / Password123!');
  console.log('  supervisor@minetech.rw / Password123!');

  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
