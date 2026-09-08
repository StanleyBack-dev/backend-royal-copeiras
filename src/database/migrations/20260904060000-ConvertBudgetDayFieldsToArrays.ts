import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * eventLocation/guestCount/durationHours used to be single values for the
 * whole budget. Multi-day budgets need one value per event day (mirroring
 * eventDates/eventArrivalTimes/eventDepartureTimes), so these columns become
 * arrays, keeping the same column/field names. Existing scalar values are
 * replicated across every existing event day on upgrade.
 */
export class ConvertBudgetDayFieldsToArrays20260904060000
  implements MigrationInterface
{
  name = "ConvertBudgetDayFieldsToArrays20260904060000";

  private static readonly fields: Array<{
    column: string;
    sqlType: "text" | "integer";
  }> = [
    { column: "event_location", sqlType: "text" },
    { column: "guest_count", sqlType: "integer" },
    { column: "duration_hours", sqlType: "integer" },
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetsTable = await queryRunner.hasTable("tb_budgets");
    if (!hasBudgetsTable) {
      return;
    }

    for (const field of ConvertBudgetDayFieldsToArrays20260904060000.fields) {
      const tempColumn = `${field.column}_arr`;
      const isAlreadyArray = await queryRunner.hasColumn(
        "tb_budgets",
        tempColumn,
      );

      if (!isAlreadyArray) {
        await queryRunner.query(`
          ALTER TABLE tb_budgets
          ADD COLUMN ${tempColumn} ${field.sqlType}[] NOT NULL DEFAULT '{}'
        `);
        await queryRunner.query(`
          UPDATE tb_budgets
          SET ${tempColumn} = CASE
            WHEN ${field.column} IS NOT NULL
              THEN array_fill(
                ${field.column},
                ARRAY[GREATEST(COALESCE(array_length(event_dates, 1), 1), 1)]
              )
            ELSE '{}'
          END
        `);
      }

      const hasOldScalarColumn = await queryRunner.hasColumn(
        "tb_budgets",
        field.column,
      );
      if (hasOldScalarColumn) {
        await queryRunner.query(`
          ALTER TABLE tb_budgets DROP COLUMN ${field.column}
        `);
        await queryRunner.query(`
          ALTER TABLE tb_budgets RENAME COLUMN ${tempColumn} TO ${field.column}
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetsTable = await queryRunner.hasTable("tb_budgets");
    if (!hasBudgetsTable) {
      return;
    }

    const scalarSqlType: Record<string, string> = {
      event_location: "varchar(255)",
      guest_count: "integer",
      duration_hours: "integer",
    };

    for (const field of [
      ...ConvertBudgetDayFieldsToArrays20260904060000.fields,
    ].reverse()) {
      const hasArrayColumn = await queryRunner.hasColumn(
        "tb_budgets",
        field.column,
      );
      if (!hasArrayColumn) {
        continue;
      }

      const tempColumn = `${field.column}_arr`;
      await queryRunner.query(`
        ALTER TABLE tb_budgets RENAME COLUMN ${field.column} TO ${tempColumn}
      `);
      await queryRunner.query(`
        ALTER TABLE tb_budgets ADD COLUMN ${field.column} ${scalarSqlType[field.column]}
      `);
      await queryRunner.query(`
        UPDATE tb_budgets SET ${field.column} = ${tempColumn}[1]
      `);
      await queryRunner.query(`
        ALTER TABLE tb_budgets DROP COLUMN ${tempColumn}
      `);
    }
  }
}
