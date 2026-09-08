import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePublicIntakeCodesTable20260904050000 implements MigrationInterface {
  name = "CreatePublicIntakeCodesTable20260904050000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_public_intake_codes");
    if (hasTable) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE tb_public_intake_codes (
        idtb_public_intake_codes uuid PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),
        idtb_users uuid REFERENCES tb_users(idtb_users) ON DELETE SET NULL,
        code varchar(12) NOT NULL,
        expires_at timestamp NOT NULL,
        verified_at timestamp,
        form_token varchar(255),
        form_token_expires_at timestamp,
        consumed_at timestamp,
        invalidated_at timestamp,
        idtb_leads_result uuid,
        idtb_budgets_result uuid,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);

    // Codes are looked up by value alone (no scoping identifier is known
    // yet), and form tokens are looked up by value once verified.
    await queryRunner.query(`
      CREATE INDEX idx_public_intake_codes_code ON tb_public_intake_codes (code)
    `);
    await queryRunner.query(`
      CREATE INDEX idx_public_intake_codes_form_token ON tb_public_intake_codes (form_token)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS tb_public_intake_codes CASCADE`,
    );
  }
}
