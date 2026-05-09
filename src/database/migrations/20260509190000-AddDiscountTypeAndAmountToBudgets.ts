import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddDiscountTypeAndAmountToBudgets20260509190000 implements MigrationInterface {
  name = "AddDiscountTypeAndAmountToBudgets20260509190000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetsTable = await queryRunner.hasTable("tb_budgets");
    if (!hasBudgetsTable) {
      return;
    }

    const hasDiscountTypeColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_type",
    );
    if (!hasDiscountTypeColumn) {
      await queryRunner.addColumn(
        "tb_budgets",
        new TableColumn({
          name: "discount_type",
          type: "enum",
          enum: ["percentage", "amount"],
          isNullable: true,
          default: null,
          comment: "Type of discount: percentage (%) or fixed amount (R$)",
        }),
      );
    }

    const hasDiscountAmountColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_amount",
    );
    if (!hasDiscountAmountColumn) {
      await queryRunner.addColumn(
        "tb_budgets",
        new TableColumn({
          name: "discount_amount",
          type: "numeric",
          precision: 12,
          scale: 2,
          isNullable: true,
          default: null,
          comment:
            "Fixed discount amount in currency when discount_type is amount",
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetsTable = await queryRunner.hasTable("tb_budgets");
    if (!hasBudgetsTable) {
      return;
    }

    const hasDiscountAmountColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_amount",
    );
    if (hasDiscountAmountColumn) {
      await queryRunner.dropColumn("tb_budgets", "discount_amount");
    }

    const hasDiscountTypeColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_type",
    );
    if (hasDiscountTypeColumn) {
      await queryRunner.dropColumn("tb_budgets", "discount_type");
    }
  }
}
