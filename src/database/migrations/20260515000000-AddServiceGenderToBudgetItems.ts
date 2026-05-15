import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServiceGenderToBudgetItems20260515000000 implements MigrationInterface {
  name = "AddServiceGenderToBudgetItems20260515000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetItemsTable = await queryRunner.hasTable("tb_budget_items");
    if (!hasBudgetItemsTable) return;

    const hasColumn = await queryRunner.hasColumn(
      "tb_budget_items",
      "service_gender",
    );

    if (!hasColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_budget_items
        ADD COLUMN service_gender varchar(32)
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetItemsTable = await queryRunner.hasTable("tb_budget_items");
    if (!hasBudgetItemsTable) return;

    const hasColumn = await queryRunner.hasColumn(
      "tb_budget_items",
      "service_gender",
    );

    if (!hasColumn) return;

    await queryRunner.query(`
      ALTER TABLE tb_budget_items
      DROP COLUMN IF EXISTS service_gender
    `);
  }
}
