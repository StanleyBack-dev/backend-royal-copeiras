import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Discount (type/percentage/amount) used to apply once to the whole budget.
 * Multi-day budgets can have a discount on one day and not another, so these
 * columns become arrays, mirroring displacementFee/eventLocation/guestCount/
 * durationHours. discount_type also drops its enum constraint in favor of a
 * plain varchar[] so "" can represent "no discount that day". Existing scalar
 * values are replicated across every existing event day on upgrade.
 */
export class ConvertBudgetDiscountFieldsToArrays20260904090000 implements MigrationInterface {
  name = "ConvertBudgetDiscountFieldsToArrays20260904090000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_budgets");
    if (!hasTable) {
      return;
    }

    const percentageTemp = "discount_percentage_arr";
    const hasPercentageArr = await queryRunner.hasColumn(
      "tb_budgets",
      percentageTemp,
    );
    if (!hasPercentageArr) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets
        ADD COLUMN ${percentageTemp} numeric(5,2)[] NOT NULL DEFAULT '{}'
      `);
      await queryRunner.query(`
        UPDATE tb_budgets
        SET ${percentageTemp} = CASE
          WHEN discount_percentage IS NOT NULL
            THEN array_fill(
              discount_percentage,
              ARRAY[GREATEST(COALESCE(array_length(event_dates, 1), 1), 1)]
            )
          ELSE array_fill(0::numeric(5,2), ARRAY[GREATEST(COALESCE(array_length(event_dates, 1), 1), 1)])
        END
      `);
    }

    const amountTemp = "discount_amount_arr";
    const hasAmountArr = await queryRunner.hasColumn("tb_budgets", amountTemp);
    if (!hasAmountArr) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets
        ADD COLUMN ${amountTemp} numeric(12,2)[] NOT NULL DEFAULT '{}'
      `);
      await queryRunner.query(`
        UPDATE tb_budgets
        SET ${amountTemp} = CASE
          WHEN discount_amount IS NOT NULL
            THEN array_fill(
              discount_amount,
              ARRAY[GREATEST(COALESCE(array_length(event_dates, 1), 1), 1)]
            )
          ELSE array_fill(0::numeric(12,2), ARRAY[GREATEST(COALESCE(array_length(event_dates, 1), 1), 1)])
        END
      `);
    }

    const typeTemp = "discount_type_arr";
    const hasTypeArr = await queryRunner.hasColumn("tb_budgets", typeTemp);
    if (!hasTypeArr) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets
        ADD COLUMN ${typeTemp} varchar(20)[] NOT NULL DEFAULT '{}'
      `);
      await queryRunner.query(`
        UPDATE tb_budgets
        SET ${typeTemp} = CASE
          WHEN discount_type IS NOT NULL
            THEN array_fill(
              discount_type::text,
              ARRAY[GREATEST(COALESCE(array_length(event_dates, 1), 1), 1)]
            )
          ELSE array_fill(''::text, ARRAY[GREATEST(COALESCE(array_length(event_dates, 1), 1), 1)])
        END
      `);
    }

    const hasOldPercentage = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_percentage",
    );
    if (hasOldPercentage) {
      await queryRunner.query(
        `ALTER TABLE tb_budgets DROP COLUMN discount_percentage`,
      );
      await queryRunner.query(`
        ALTER TABLE tb_budgets RENAME COLUMN ${percentageTemp} TO discount_percentage
      `);
    }

    const hasOldAmount = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_amount",
    );
    if (hasOldAmount) {
      await queryRunner.query(
        `ALTER TABLE tb_budgets DROP COLUMN discount_amount`,
      );
      await queryRunner.query(`
        ALTER TABLE tb_budgets RENAME COLUMN ${amountTemp} TO discount_amount
      `);
    }

    const hasOldType = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_type",
    );
    if (hasOldType) {
      await queryRunner.query(
        `ALTER TABLE tb_budgets DROP COLUMN discount_type`,
      );
      await queryRunner.query(`
        ALTER TABLE tb_budgets RENAME COLUMN ${typeTemp} TO discount_type
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_budgets");
    if (!hasTable) {
      return;
    }

    const hasType = await queryRunner.hasColumn("tb_budgets", "discount_type");
    if (hasType) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets RENAME COLUMN discount_type TO discount_type_arr
      `);
      await queryRunner.query(`
        ALTER TABLE tb_budgets ADD COLUMN discount_type varchar(20)
      `);
      await queryRunner.query(`
        UPDATE tb_budgets SET discount_type = NULLIF(discount_type_arr[1], '')
      `);
      await queryRunner.query(
        `ALTER TABLE tb_budgets DROP COLUMN discount_type_arr`,
      );
    }

    const hasAmount = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_amount",
    );
    if (hasAmount) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets RENAME COLUMN discount_amount TO discount_amount_arr
      `);
      await queryRunner.query(`
        ALTER TABLE tb_budgets ADD COLUMN discount_amount numeric(12,2)
      `);
      await queryRunner.query(`
        UPDATE tb_budgets SET discount_amount = discount_amount_arr[1]
      `);
      await queryRunner.query(
        `ALTER TABLE tb_budgets DROP COLUMN discount_amount_arr`,
      );
    }

    const hasPercentage = await queryRunner.hasColumn(
      "tb_budgets",
      "discount_percentage",
    );
    if (hasPercentage) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets RENAME COLUMN discount_percentage TO discount_percentage_arr
      `);
      await queryRunner.query(`
        ALTER TABLE tb_budgets ADD COLUMN discount_percentage numeric(5,2)
      `);
      await queryRunner.query(`
        UPDATE tb_budgets SET discount_percentage = discount_percentage_arr[1]
      `);
      await queryRunner.query(
        `ALTER TABLE tb_budgets DROP COLUMN discount_percentage_arr`,
      );
    }
  }
}
