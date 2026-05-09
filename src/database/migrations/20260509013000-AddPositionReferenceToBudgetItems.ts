import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPositionReferenceToBudgetItems20260509013000 implements MigrationInterface {
  name = "AddPositionReferenceToBudgetItems20260509013000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetItemsTable = await queryRunner.hasTable("tb_budget_items");
    if (!hasBudgetItemsTable) {
      return;
    }

    const hasPositionsTable = await queryRunner.hasTable("tb_positions");
    if (!hasPositionsTable) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(
      "tb_budget_items",
      "idtb_positions",
    );
    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_budget_items
        ADD COLUMN idtb_positions uuid
      `);
    }

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_tb_budget_items_positions
      ON tb_budget_items (idtb_positions)
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_tb_budget_items_positions'
        ) THEN
          ALTER TABLE tb_budget_items
          ADD CONSTRAINT FK_tb_budget_items_positions
          FOREIGN KEY (idtb_positions)
          REFERENCES tb_positions(idtb_positions)
          ON DELETE RESTRICT;
        END IF;
      END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetItemsTable = await queryRunner.hasTable("tb_budget_items");
    if (!hasBudgetItemsTable) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(
      "tb_budget_items",
      "idtb_positions",
    );

    if (!hasColumn) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE tb_budget_items
      DROP CONSTRAINT IF EXISTS FK_tb_budget_items_positions
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS IDX_tb_budget_items_positions
    `);

    await queryRunner.query(`
      ALTER TABLE tb_budget_items
      DROP COLUMN idtb_positions
    `);
  }
}
