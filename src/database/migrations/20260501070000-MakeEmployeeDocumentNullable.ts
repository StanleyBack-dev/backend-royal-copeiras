import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeEmployeeDocumentNullable20260501070000 implements MigrationInterface {
  name = "MakeEmployeeDocumentNullable20260501070000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasEmployeesTable = await queryRunner.hasTable("tb_employees");
    if (!hasEmployeesTable) {
      return;
    }

    const [documentColumn] = await queryRunner.query(
      `
        SELECT is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tb_employees'
          AND column_name = 'document'
      `,
    );

    if (!documentColumn) {
      return;
    }

    await queryRunner.query(`
      UPDATE tb_employees
      SET document = NULL
      WHERE document = ''
    `);

    if (String(documentColumn.is_nullable).toUpperCase() === "NO") {
      await queryRunner.query(`
        ALTER TABLE tb_employees
        ALTER COLUMN document DROP NOT NULL
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasEmployeesTable = await queryRunner.hasTable("tb_employees");
    if (!hasEmployeesTable) {
      return;
    }

    const [documentColumn] = await queryRunner.query(
      `
        SELECT is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'tb_employees'
          AND column_name = 'document'
      `,
    );

    if (!documentColumn) {
      return;
    }

    await queryRunner.query(`
      UPDATE tb_employees
      SET document = '00000000000'
      WHERE document IS NULL
    `);

    if (String(documentColumn.is_nullable).toUpperCase() === "YES") {
      await queryRunner.query(`
        ALTER TABLE tb_employees
        ALTER COLUMN document SET NOT NULL
      `);
    }
  }
}
