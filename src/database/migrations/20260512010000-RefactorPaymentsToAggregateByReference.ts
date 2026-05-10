import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorPaymentsToAggregateByReference20260512010000 implements MigrationInterface {
  name = "RefactorPaymentsToAggregateByReference20260512010000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasEventsColumn = await queryRunner.hasColumn(
      "tb_payments",
      "idtb_events",
    );
    if (!hasEventsColumn) {
      await queryRunner.query(`
        ALTER TABLE tb_payments
        ADD COLUMN idtb_events uuid NULL
      `);

      await queryRunner.query(`
        ALTER TABLE tb_payments
        ADD CONSTRAINT FK_tb_payments_events
        FOREIGN KEY (idtb_events)
        REFERENCES tb_events(idtb_events)
        ON DELETE CASCADE
      `);

      await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS IDX_tb_payments_events ON tb_payments (idtb_events)
      `);
    }

    const hasPaymentItemsTable = await queryRunner.hasTable("tb_payment_items");
    if (!hasPaymentItemsTable) {
      await queryRunner.query(`
        CREATE TABLE tb_payment_items (
          idtb_payment_items uuid PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),
          idtb_payments uuid NOT NULL,
          origin tb_payments_origin_enum NOT NULL,
          status tb_payments_status_enum NOT NULL DEFAULT 'pendente',
          planned_amount numeric(12, 2) NOT NULL,
          paid_amount numeric(12, 2) DEFAULT 0,
          payment_date timestamp,
          due_date date,
          proof_url varchar(500),
          notes text,
          sort_order int NOT NULL DEFAULT 0,
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now(),
          CONSTRAINT FK_tb_payment_items_payments FOREIGN KEY (idtb_payments)
            REFERENCES tb_payments(idtb_payments) ON DELETE CASCADE
        )
      `);

      await queryRunner.query(`
        CREATE INDEX IDX_tb_payment_items_payments ON tb_payment_items (idtb_payments)
      `);

      await queryRunner.query(`
        CREATE INDEX IDX_tb_payment_items_origin ON tb_payment_items (origin)
      `);

      await queryRunner.query(`
        CREATE INDEX IDX_tb_payment_items_status ON tb_payment_items (status)
      `);

      await queryRunner.query(`
        INSERT INTO tb_payment_items (
          idtb_payments,
          origin,
          status,
          planned_amount,
          paid_amount,
          payment_date,
          due_date,
          proof_url,
          notes,
          sort_order,
          created_at,
          updated_at
        )
        SELECT
          p.idtb_payments,
          p.origin,
          p.status,
          p.planned_amount,
          COALESCE(p.paid_amount, 0),
          p.payment_date,
          p.due_date,
          p.proof_url,
          p.notes,
          0,
          p.created_at,
          p.updated_at
        FROM tb_payments p
        WHERE NOT EXISTS (
          SELECT 1
          FROM tb_payment_items i
          WHERE i.idtb_payments = p.idtb_payments
        )
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasPaymentItemsTable = await queryRunner.hasTable("tb_payment_items");
    if (hasPaymentItemsTable) {
      await queryRunner.query(`DROP TABLE IF EXISTS tb_payment_items CASCADE`);
    }

    const hasEventsColumn = await queryRunner.hasColumn(
      "tb_payments",
      "idtb_events",
    );
    if (hasEventsColumn) {
      await queryRunner.query(`
        DROP INDEX IF EXISTS IDX_tb_payments_events
      `);
      await queryRunner.query(`
        ALTER TABLE tb_payments
        DROP CONSTRAINT IF EXISTS FK_tb_payments_events
      `);
      await queryRunner.query(`
        ALTER TABLE tb_payments
        DROP COLUMN IF EXISTS idtb_events
      `);
    }
  }
}
