import { MigrationInterface, QueryRunner } from "typeorm";

export class ResetPositionsAndDependencies20260509170000 implements MigrationInterface {
  name = "ResetPositionsAndDependencies20260509170000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasPositionsTable = await queryRunner.hasTable("tb_positions");
    if (!hasPositionsTable) {
      return;
    }

    const hasEmployeesTable = await queryRunner.hasTable("tb_employees");
    const hasBudgetItemsTable = await queryRunner.hasTable("tb_budget_items");

    if (hasBudgetItemsTable) {
      const hasBudgetItemsPositionColumn = await queryRunner.hasColumn(
        "tb_budget_items",
        "idtb_positions",
      );

      if (hasBudgetItemsPositionColumn) {
        await queryRunner.query(`
          UPDATE tb_budget_items
          SET idtb_positions = NULL
          WHERE idtb_positions IS NOT NULL
        `);
      }
    }

    if (hasEmployeesTable) {
      const hasEmployeesPositionColumn = await queryRunner.hasColumn(
        "tb_employees",
        "idtb_positions",
      );

      if (hasEmployeesPositionColumn) {
        await queryRunner.query(`
          ALTER TABLE tb_employees
          DROP CONSTRAINT IF EXISTS FK_tb_employees_positions
        `);

        await queryRunner.query(`
          ALTER TABLE tb_employees
          ALTER COLUMN idtb_positions DROP NOT NULL
        `);

        await queryRunner.query(`
          UPDATE tb_employees
          SET idtb_positions = NULL
          WHERE idtb_positions IS NOT NULL
        `);

        await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1
              FROM pg_constraint
              WHERE conname = 'FK_tb_employees_positions'
            ) THEN
              ALTER TABLE tb_employees
              ADD CONSTRAINT FK_tb_employees_positions
              FOREIGN KEY (idtb_positions)
              REFERENCES tb_positions(idtb_positions)
              ON DELETE RESTRICT;
            END IF;
          END $$
        `);
      }
    }

    await queryRunner.query(`
      DELETE FROM tb_positions
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    return;
  }
}
