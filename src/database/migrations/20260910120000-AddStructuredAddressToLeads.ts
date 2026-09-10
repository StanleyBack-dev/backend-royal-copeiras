import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Breaks the lead address out of the single free-text `address` column into the
 * structured fields real client documents use (logradouro / número /
 * complemento / bairro-distrito), alongside the already existing city / state /
 * zip. The old `address` column is kept as history and as a fallback for the
 * contract PDF; existing values are copied into `address_street`.
 */
export class AddStructuredAddressToLeads20260910120000 implements MigrationInterface {
  name = "AddStructuredAddressToLeads20260910120000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_leads");
    if (!hasTable) {
      return;
    }

    if (!(await queryRunner.hasColumn("tb_leads", "address_street"))) {
      await queryRunner.query(`
        ALTER TABLE tb_leads ADD COLUMN address_street varchar(160)
      `);
    }

    if (!(await queryRunner.hasColumn("tb_leads", "address_number"))) {
      await queryRunner.query(`
        ALTER TABLE tb_leads ADD COLUMN address_number varchar(20)
      `);
    }

    if (!(await queryRunner.hasColumn("tb_leads", "address_complement"))) {
      await queryRunner.query(`
        ALTER TABLE tb_leads ADD COLUMN address_complement varchar(120)
      `);
    }

    if (!(await queryRunner.hasColumn("tb_leads", "address_neighborhood"))) {
      await queryRunner.query(`
        ALTER TABLE tb_leads ADD COLUMN address_neighborhood varchar(120)
      `);
    }

    // Backfill: move the legacy free-text address into logradouro. No heuristic
    // splitting of number/neighborhood — the raw text is the safest guess.
    await queryRunner.query(`
      UPDATE tb_leads
      SET address_street = address
      WHERE address IS NOT NULL
        AND btrim(address) <> ''
        AND address_street IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_leads");
    if (!hasTable) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE tb_leads DROP COLUMN IF EXISTS address_neighborhood
    `);
    await queryRunner.query(`
      ALTER TABLE tb_leads DROP COLUMN IF EXISTS address_complement
    `);
    await queryRunner.query(`
      ALTER TABLE tb_leads DROP COLUMN IF EXISTS address_number
    `);
    await queryRunner.query(`
      ALTER TABLE tb_leads DROP COLUMN IF EXISTS address_street
    `);
  }
}
