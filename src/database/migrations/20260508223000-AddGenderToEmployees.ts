import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGenderToEmployees20260508223000 implements MigrationInterface {
  name = "AddGenderToEmployees20260508223000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasEmployeesTable = await queryRunner.hasTable("tb_employees");
    if (!hasEmployeesTable) {
      return;
    }

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public'
            AND t.typname = 'tb_employees_gender_enum'
        ) THEN
          CREATE TYPE "tb_employees_gender_enum" AS ENUM ('MALE', 'FEMALE');
        END IF;
      END $$
    `);

    const hasGenderColumn = await queryRunner.hasColumn(
      "tb_employees",
      "gender",
    );

    if (!hasGenderColumn) {
      await queryRunner.query(`
        ALTER TABLE "tb_employees"
        ADD COLUMN "gender" "tb_employees_gender_enum"
      `);
    }

    await queryRunner.query(`
      UPDATE "tb_employees"
      SET "gender" = 'FEMALE'
      WHERE "gender" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_employees"
      ALTER COLUMN "gender" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasEmployeesTable = await queryRunner.hasTable("tb_employees");

    if (hasEmployeesTable) {
      const hasGenderColumn = await queryRunner.hasColumn(
        "tb_employees",
        "gender",
      );

      if (hasGenderColumn) {
        await queryRunner.query(`
          ALTER TABLE "tb_employees"
          DROP COLUMN "gender"
        `);
      }
    }

    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public'
            AND t.typname = 'tb_employees_gender_enum'
        ) THEN
          DROP TYPE "tb_employees_gender_enum";
        END IF;
      END $$
    `);
  }
}
