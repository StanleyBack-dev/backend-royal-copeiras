import { MigrationInterface, QueryRunner } from "typeorm";

export class StandardizeTimestampsWithoutTimezone20260506183000 implements MigrationInterface {
  name = "StandardizeTimestampsWithoutTimezone20260506183000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tb_employees"
      ALTER COLUMN "created_at" TYPE timestamp without time zone USING "created_at",
      ALTER COLUMN "updated_at" TYPE timestamp without time zone USING "updated_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_customers"
      ALTER COLUMN "created_at" TYPE timestamp without time zone USING "created_at",
      ALTER COLUMN "updated_at" TYPE timestamp without time zone USING "updated_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_leads"
      ALTER COLUMN "created_at" TYPE timestamp without time zone USING "created_at",
      ALTER COLUMN "updated_at" TYPE timestamp without time zone USING "updated_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_events"
      ALTER COLUMN "created_at" TYPE timestamp without time zone USING "created_at",
      ALTER COLUMN "updated_at" TYPE timestamp without time zone USING "updated_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_event_assignments"
      ALTER COLUMN "created_at" TYPE timestamp without time zone USING "created_at",
      ALTER COLUMN "updated_at" TYPE timestamp without time zone USING "updated_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_budget_items"
      ALTER COLUMN "created_at" TYPE timestamp without time zone USING "created_at",
      ALTER COLUMN "updated_at" TYPE timestamp without time zone USING "updated_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_budgets"
      ALTER COLUMN "sent_at" TYPE timestamp without time zone USING "sent_at" AT TIME ZONE 'America/Sao_Paulo',
      ALTER COLUMN "created_at" TYPE timestamp without time zone USING "created_at",
      ALTER COLUMN "updated_at" TYPE timestamp without time zone USING "updated_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_contracts"
      ALTER COLUMN "sent_at" TYPE timestamp without time zone USING "sent_at" AT TIME ZONE 'America/Sao_Paulo',
      ALTER COLUMN "created_at" TYPE timestamp without time zone USING "created_at",
      ALTER COLUMN "updated_at" TYPE timestamp without time zone USING "updated_at";
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_signatures"
      ALTER COLUMN "signed_at" TYPE timestamp without time zone USING "signed_at" AT TIME ZONE 'America/Sao_Paulo',
      ALTER COLUMN "consent_at" TYPE timestamp without time zone USING "consent_at" AT TIME ZONE 'America/Sao_Paulo',
      ALTER COLUMN "created_at" TYPE timestamp without time zone USING "created_at",
      ALTER COLUMN "updated_at" TYPE timestamp without time zone USING "updated_at";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tb_budgets"
      ALTER COLUMN "sent_at" TYPE timestamptz USING "sent_at" AT TIME ZONE 'America/Sao_Paulo';
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_contracts"
      ALTER COLUMN "sent_at" TYPE timestamptz USING "sent_at" AT TIME ZONE 'America/Sao_Paulo';
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_signatures"
      ALTER COLUMN "signed_at" TYPE timestamptz USING "signed_at" AT TIME ZONE 'America/Sao_Paulo',
      ALTER COLUMN "consent_at" TYPE timestamptz USING "consent_at" AT TIME ZONE 'America/Sao_Paulo';
    `);
  }
}
