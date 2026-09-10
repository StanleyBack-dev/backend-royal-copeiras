import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Lets a budget line be either staffing (LABOR, linked to tb_positions) or a
 * material/consumable (SUPPLY, linked to tb_supplies) without mixing the two
 * concerns. Existing rows are all LABOR.
 */
export class AddItemTypeAndSupplyToBudgetItems20260908140000 implements MigrationInterface {
  name = "AddItemTypeAndSupplyToBudgetItems20260908140000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_budget_items");
    if (!hasTable) {
      return;
    }

    if (!(await queryRunner.hasColumn("tb_budget_items", "item_type"))) {
      await queryRunner.query(`
        ALTER TABLE tb_budget_items
        ADD COLUMN item_type varchar(16) NOT NULL DEFAULT 'LABOR'
      `);
    }

    if (!(await queryRunner.hasColumn("tb_budget_items", "idtb_supplies"))) {
      await queryRunner.query(`
        ALTER TABLE tb_budget_items
        ADD COLUMN idtb_supplies uuid
      `);
      await queryRunner.query(`
        ALTER TABLE tb_budget_items
        ADD CONSTRAINT fk_tb_budget_items_supplies
        FOREIGN KEY (idtb_supplies) REFERENCES tb_supplies(idtb_supplies)
        ON DELETE RESTRICT
      `);
    }

    if (!(await queryRunner.hasColumn("tb_budget_items", "unit"))) {
      await queryRunner.query(`
        ALTER TABLE tb_budget_items
        ADD COLUMN unit varchar(32)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_budget_items");
    if (!hasTable) {
      return;
    }

    if (await queryRunner.hasColumn("tb_budget_items", "idtb_supplies")) {
      await queryRunner.query(`
        ALTER TABLE tb_budget_items
        DROP CONSTRAINT IF EXISTS fk_tb_budget_items_supplies
      `);
      await queryRunner.query(`
        ALTER TABLE tb_budget_items DROP COLUMN IF EXISTS idtb_supplies
      `);
    }

    await queryRunner.query(`
      ALTER TABLE tb_budget_items DROP COLUMN IF EXISTS unit
    `);
    await queryRunner.query(`
      ALTER TABLE tb_budget_items DROP COLUMN IF EXISTS item_type
    `);
  }
}
