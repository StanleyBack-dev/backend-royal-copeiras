import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeEmployeeGenderNullable20260508234500 implements MigrationInterface {
  name = "MakeEmployeeGenderNullable20260508234500";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasEmployeesTable = await queryRunner.hasTable("tb_employees");
    if (!hasEmployeesTable) {
      return;
    }

    const hasGenderColumn = await queryRunner.hasColumn(
      "tb_employees",
      "gender",
    );
    if (!hasGenderColumn) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE "tb_employees"
      ALTER COLUMN "gender" DROP NOT NULL
    `);

    await queryRunner.query(`
      UPDATE "tb_employees"
      SET "gender" = NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasEmployeesTable = await queryRunner.hasTable("tb_employees");
    if (!hasEmployeesTable) {
      return;
    }

    const hasGenderColumn = await queryRunner.hasColumn(
      "tb_employees",
      "gender",
    );
    if (!hasGenderColumn) {
      return;
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
}
