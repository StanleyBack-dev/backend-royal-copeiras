import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeEmployeeDocumentNullable20260501070000 implements MigrationInterface {
  name = "MakeEmployeeDocumentNullable20260501070000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE tb_employees
      SET document = NULL
      WHERE document = ''
    `);

    await queryRunner.query(`
      ALTER TABLE tb_employees
      ALTER COLUMN document DROP NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE tb_employees
      SET document = '00000000000'
      WHERE document IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE tb_employees
      ALTER COLUMN document SET NOT NULL
    `);
  }
}
