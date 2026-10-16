import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Event financials stop relying on hard-coded overtime values:
 * - `tb_events.overtime_hourly_rate`: amount charged per allocated employee per
 *   overtime hour (was a fixed R$ 90 in code).
 * - `tb_events.extra_expenses`: itemized extra costs paid out of the event
 *   (snacks, ride-hailing, etc.), stored as `[{ description, amount }]`.
 * - `tb_event_assignments.overtime_hourly_payment`: amount paid to the employee
 *   per overtime hour.
 */
export class AddOvertimeRatesAndExtraExpensesToEvents20261015100000 implements MigrationInterface {
  name = "AddOvertimeRatesAndExtraExpensesToEvents20261015100000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable("tb_events")) {
      if (!(await queryRunner.hasColumn("tb_events", "overtime_hourly_rate"))) {
        await queryRunner.query(`
          ALTER TABLE tb_events
          ADD COLUMN overtime_hourly_rate numeric(12,2) NOT NULL DEFAULT 90
        `);
      }

      if (!(await queryRunner.hasColumn("tb_events", "extra_expenses"))) {
        await queryRunner.query(`
          ALTER TABLE tb_events
          ADD COLUMN extra_expenses jsonb NOT NULL DEFAULT '[]'::jsonb
        `);
      }
    }

    if (await queryRunner.hasTable("tb_event_assignments")) {
      if (
        !(await queryRunner.hasColumn(
          "tb_event_assignments",
          "overtime_hourly_payment",
        ))
      ) {
        await queryRunner.query(`
          ALTER TABLE tb_event_assignments
          ADD COLUMN overtime_hourly_payment numeric(12,2) NOT NULL DEFAULT 0
        `);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable("tb_event_assignments")) {
      await queryRunner.query(`
        ALTER TABLE tb_event_assignments DROP COLUMN IF EXISTS overtime_hourly_payment
      `);
    }

    if (await queryRunner.hasTable("tb_events")) {
      await queryRunner.query(`
        ALTER TABLE tb_events DROP COLUMN IF EXISTS extra_expenses
      `);
      await queryRunner.query(`
        ALTER TABLE tb_events DROP COLUMN IF EXISTS overtime_hourly_rate
      `);
    }
  }
}
