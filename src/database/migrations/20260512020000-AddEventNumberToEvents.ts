import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEventNumberToEvents20260512020000 implements MigrationInterface {
  name = "AddEventNumberToEvents20260512020000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasEventsTable = await queryRunner.hasTable("tb_events");
    if (!hasEventsTable) {
      return;
    }

    const hasEventNumberColumn = await queryRunner.hasColumn(
      "tb_events",
      "event_number",
    );

    if (!hasEventNumberColumn) {
      await queryRunner.addColumn(
        "tb_events",
        new TableColumn({
          name: "event_number",
          type: "varchar",
          length: "20",
          isNullable: true,
        }),
      );
    }

    await queryRunner.query(`
      WITH numbered_events AS (
        SELECT
          idtb_events,
          CONCAT(
            'EVT-',
            EXTRACT(YEAR FROM created_at)::text,
            '-',
            LPAD(
              ROW_NUMBER() OVER (
                PARTITION BY EXTRACT(YEAR FROM created_at)
                ORDER BY created_at ASC, idtb_events ASC
              )::text,
              5,
              '0'
            )
          ) AS generated_event_number
        FROM tb_events
      )
      UPDATE tb_events AS event
      SET event_number = numbered_events.generated_event_number
      FROM numbered_events
      WHERE event.idtb_events = numbered_events.idtb_events
        AND (event.event_number IS NULL OR event.event_number = '');
    `);

    await queryRunner.query(`
      ALTER TABLE tb_events
      ALTER COLUMN event_number SET NOT NULL;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tb_events_event_number
      ON tb_events (event_number);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasEventsTable = await queryRunner.hasTable("tb_events");
    if (!hasEventsTable) {
      return;
    }

    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_tb_events_event_number;
    `);

    const hasEventNumberColumn = await queryRunner.hasColumn(
      "tb_events",
      "event_number",
    );
    if (hasEventNumberColumn) {
      await queryRunner.dropColumn("tb_events", "event_number");
    }
  }
}
