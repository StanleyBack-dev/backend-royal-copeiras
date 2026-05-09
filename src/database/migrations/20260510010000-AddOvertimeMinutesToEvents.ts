import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddOvertimeMinutesToEvents20260510010000 implements MigrationInterface {
  name = "AddOvertimeMinutesToEvents20260510010000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasEventsTable = await queryRunner.hasTable("tb_events");
    if (!hasEventsTable) {
      return;
    }

    const hasOvertimeMinutesColumn = await queryRunner.hasColumn(
      "tb_events",
      "overtime_minutes",
    );
    if (hasOvertimeMinutesColumn) {
      return;
    }

    await queryRunner.addColumn(
      "tb_events",
      new TableColumn({
        name: "overtime_minutes",
        type: "int",
        isNullable: false,
        default: 0,
        comment:
          "Extra time in minutes for the event. Must be informed in 30-minute intervals.",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasEventsTable = await queryRunner.hasTable("tb_events");
    if (!hasEventsTable) {
      return;
    }

    const hasOvertimeMinutesColumn = await queryRunner.hasColumn(
      "tb_events",
      "overtime_minutes",
    );
    if (hasOvertimeMinutesColumn) {
      await queryRunner.dropColumn("tb_events", "overtime_minutes");
    }
  }
}
