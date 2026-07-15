import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1752400000000 implements MigrationInterface {
  name = 'InitSchema1752400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`);

    await queryRunner.query(`CREATE TYPE "users_role_enum" AS ENUM ('ADMIN', 'SUPERVISOR')`);
    await queryRunner.query(`CREATE TYPE "shifts_status_enum" AS ENUM ('ON_SHIFT', 'OFF_SHIFT')`);
    await queryRunner.query(
      `CREATE TYPE "incidents_status_enum" AS ENUM ('REPORTED', 'UNDER_REVIEW', 'RESOLVED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "tenants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "slug" varchar NOT NULL UNIQUE,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "fullName" varchar NOT NULL,
        "email" varchar NOT NULL,
        "passwordHash" varchar NOT NULL,
        "role" "users_role_enum" NOT NULL DEFAULT 'SUPERVISOR'
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_users_tenantId" ON "users" ("tenantId")`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_tenantId_email" ON "users" ("tenantId", "email")`,
    );

    await queryRunner.query(`
      CREATE TABLE "workers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "fullName" varchar NOT NULL,
        "role" varchar,
        "employeeCode" varchar NOT NULL UNIQUE
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_workers_tenantId" ON "workers" ("tenantId")`);

    await queryRunner.query(`
      CREATE TABLE "shifts" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "workerId" uuid NOT NULL,
        "status" "shifts_status_enum" NOT NULL DEFAULT 'ON_SHIFT',
        "checkInAt" timestamptz NOT NULL,
        "checkOutAt" timestamptz,
        CONSTRAINT "FK_shifts_worker" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_shifts_tenantId_status" ON "shifts" ("tenantId", "status")`,
    );

    await queryRunner.query(`
      CREATE TABLE "incidents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "tenantId" uuid NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        "title" varchar NOT NULL,
        "description" text NOT NULL,
        "location" varchar NOT NULL,
        "status" "incidents_status_enum" NOT NULL DEFAULT 'REPORTED',
        "photoObjectKey" varchar NOT NULL,
        "reportedByUserId" uuid NOT NULL,
        "reportedByEmail" varchar NOT NULL,
        "workerId" uuid
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_incidents_tenantId_status" ON "incidents" ("tenantId", "status")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "incidents"`);
    await queryRunner.query(`DROP TABLE "shifts"`);
    await queryRunner.query(`DROP TABLE "workers"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(`DROP TYPE "incidents_status_enum"`);
    await queryRunner.query(`DROP TYPE "shifts_status_enum"`);
    await queryRunner.query(`DROP TYPE "users_role_enum"`);
  }
}
