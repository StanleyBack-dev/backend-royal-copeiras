import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePaymentsTable20260511000000 implements MigrationInterface {
  name = "CreatePaymentsTable20260511000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasPaymentsTable = await queryRunner.hasTable("tb_payments");
    if (hasPaymentsTable) {
      return;
    }

    // Create enum types
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tb_payments_origin_enum') THEN
          CREATE TYPE tb_payments_origin_enum AS ENUM (
            'budget_advance',
            'budget_total',
            'contract',
            'material',
            'overtime'
          );
        END IF;
      END $$
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tb_payments_status_enum') THEN
          CREATE TYPE tb_payments_status_enum AS ENUM (
            'pendente',
            'parcial',
            'pago',
            'cancelado'
          );
        END IF;
      END $$
    `);

    // Create tb_payments table
    await queryRunner.query(`
      CREATE TABLE tb_payments (
        idtb_payments uuid PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),
        idtb_users uuid NOT NULL,
        idtb_leads uuid,
        idtb_budgets uuid,
        idtb_contracts uuid,
        idtb_employees uuid,
        origin tb_payments_origin_enum NOT NULL,
        status tb_payments_status_enum NOT NULL DEFAULT 'pendente',
        planned_amount numeric(12, 2) NOT NULL,
        paid_amount numeric(12, 2) DEFAULT 0,
        payment_date timestamp,
        due_date date,
        proof_url varchar(500),
        notes text,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now(),
        CONSTRAINT FK_tb_payments_users FOREIGN KEY (idtb_users)
          REFERENCES tb_users(idtb_users) ON DELETE CASCADE,
        CONSTRAINT FK_tb_payments_leads FOREIGN KEY (idtb_leads)
          REFERENCES tb_leads(idtb_leads) ON DELETE SET NULL,
        CONSTRAINT FK_tb_payments_budgets FOREIGN KEY (idtb_budgets)
          REFERENCES tb_budgets(idtb_budgets) ON DELETE CASCADE,
        CONSTRAINT FK_tb_payments_contracts FOREIGN KEY (idtb_contracts)
          REFERENCES tb_contracts(idtb_contracts) ON DELETE CASCADE,
        CONSTRAINT FK_tb_payments_employees FOREIGN KEY (idtb_employees)
          REFERENCES tb_employees(idtb_employees) ON DELETE SET NULL
      )
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX IDX_tb_payments_users ON tb_payments (idtb_users)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_tb_payments_leads ON tb_payments (idtb_leads)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_tb_payments_budgets ON tb_payments (idtb_budgets)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_tb_payments_contracts ON tb_payments (idtb_contracts)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_tb_payments_employees ON tb_payments (idtb_employees)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_tb_payments_origin ON tb_payments (origin)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_tb_payments_status ON tb_payments (status)
    `);

    await queryRunner.query(`
      CREATE INDEX IDX_tb_payments_users_status ON tb_payments (idtb_users, status)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasPaymentsTable = await queryRunner.hasTable("tb_payments");

    if (hasPaymentsTable) {
      await queryRunner.query(`
        DROP TABLE IF EXISTS tb_payments CASCADE
      `);
    }

    await queryRunner.query(`
      DROP TYPE IF EXISTS tb_payments_status_enum CASCADE
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS tb_payments_origin_enum CASCADE
    `);
  }
}
