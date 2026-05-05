import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventTimesToBudgets20260505110000 implements MigrationInterface {
  name = "AddEventTimesToBudgets20260505110000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetsTable = await queryRunner.hasTable("tb_budgets");
    if (!hasBudgetsTable) {
      return;
    }

    const hasArrivalTimesColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "event_arrival_times",
    );

    if (!hasArrivalTimesColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets
        ADD COLUMN event_arrival_times text[] NOT NULL DEFAULT '{}'
      `);
    }

    const hasDepartureTimesColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "event_departure_times",
    );

    if (!hasDepartureTimesColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets
        ADD COLUMN event_departure_times text[] NOT NULL DEFAULT '{}'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetsTable = await queryRunner.hasTable("tb_budgets");
    if (!hasBudgetsTable) {
      return;
    }

    const hasDepartureTimesColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "event_departure_times",
    );

    if (hasDepartureTimesColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets
        DROP COLUMN event_departure_times
      `);
    }

    const hasArrivalTimesColumn = await queryRunner.hasColumn(
      "tb_budgets",
      "event_arrival_times",
    );

    if (hasArrivalTimesColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_budgets
        DROP COLUMN event_arrival_times
      `);
    }
  }
}
