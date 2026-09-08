import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * displacementFee used to be a single value for the whole budget. Multi-day
 * budgets can have a different displacement cost per event day, so this
 * column becomes an array (numeric[]), mirroring eventLocation/guestCount/
 * durationHours. Existing scalar values are replicated across every existing
 * event day on upgrade.
 */
export class ConvertBudgetDisplacementFeeToArray20260904080000 implements MigrationInterface {
  name = "ConvertBudgetDisplacementFeeToArray20260904080000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_budgets");
    if (!hasTable) {
      return;
    }

    const tempColumn = "displacement_fee_arr";
    const isAlreadyArray = await queryRunner.hasColumn(
      "tb_budgets",
      tempColumn,
    );

    if (!isAlreadyArray) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets
        ADD COLUMN ${tempColumn} numeric(12,2)[] NOT NULL DEFAULT '{}'
      `);
      await queryRunner.query(`
        UPDATE tb_budgets
        SET ${tempColumn} = CASE
          WHEN displacement_fee IS NOT NULL
            THEN array_fill(
              displacement_fee,
              ARRAY[GREATEST(COALESCE(array_length(event_dates, 1), 1), 1)]
            )
          ELSE '{}'
        END
      `);
    }

    const hasOldScalarColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "displacement_fee",
    );
    if (hasOldScalarColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets DROP COLUMN displacement_fee
      `);
      await queryRunner.query(`
        ALTER TABLE tb_budgets RENAME COLUMN ${tempColumn} TO displacement_fee
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_budgets");
    if (!hasTable) {
      return;
    }

    const hasArrayColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "displacement_fee",
    );
    if (!hasArrayColumn) {
      return;
    }

    const tempColumn = "displacement_fee_arr";
    await queryRunner.query(`
      ALTER TABLE tb_budgets RENAME COLUMN displacement_fee TO ${tempColumn}
    `);
    await queryRunner.query(`
      ALTER TABLE tb_budgets ADD COLUMN displacement_fee numeric(12,2) NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      UPDATE tb_budgets SET displacement_fee = COALESCE(${tempColumn}[1], 0)
    `);
    await queryRunner.query(`
      ALTER TABLE tb_budgets DROP COLUMN ${tempColumn}
    `);
  }
}
