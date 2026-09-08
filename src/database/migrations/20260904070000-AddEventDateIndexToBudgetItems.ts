import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Lets a budget item be pinned to one specific event day (e.g. "3 copeiras"
 * on day 1, "5 garçons" on day 2) instead of applying to the whole budget.
 * Existing items default to day 0 (the first/only event date), which keeps
 * single-day budgets and already-created multi-day budgets unchanged.
 */
export class AddEventDateIndexToBudgetItems20260904070000 implements MigrationInterface {
  name = "AddEventDateIndexToBudgetItems20260904070000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_budget_items");
    if (!hasTable) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(
      "tb_budget_items",
      "event_date_index",
    );

    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_budget_items
        ADD COLUMN event_date_index integer NOT NULL DEFAULT 0
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_budget_items");
    if (!hasTable) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(
      "tb_budget_items",
      "event_date_index",
    );

    if (hasColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_budget_items DROP COLUMN event_date_index
      `);
    }
  }
}
