import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDiscountPercentageToBudgets20260509180000 implements MigrationInterface {
  name = "AddDiscountPercentageToBudgets20260509180000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetsTable = await queryRunner.hasTable("tb_budgets");
    if (!hasBudgetsTable) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_percentage",
    );
    if (hasColumn) {
      return;
    }

    await queryRunner.addColumn(
      "tb_budgets",
      new TableColumn({
        name: "discount_percentage",
        type: "numeric",
        precision: 5,
        scale: 2,
        isNullable: true,
        default: null,
        comment: "Optional discount percentage (0-100) applied to budget total",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetsTable = await queryRunner.hasTable("tb_budgets");
    if (!hasBudgetsTable) {
      return;
    }

    const hasColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_percentage",
    );
    if (hasColumn) {
      await queryRunner.dropColumn("tb_budgets", "discount_percentage");
    }
  }
}
