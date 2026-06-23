import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSignerTypeAndFixSignatureDates1719169200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Add signer_type enum and column to tb_signatures
    await queryRunner.query(`
      CREATE TYPE "tb_signatures_signer_type_enum" AS ENUM ('CLIENT', 'COMPANY', 'OTHER')
    `);

    await queryRunner.query(`
      ALTER TABLE "tb_signatures" 
      ADD COLUMN "signer_type" "tb_signatures_signer_type_enum" NULL
    `);

    // Step 2: Populate signer_type based on signer_index
    // signer_index 0 = CLIENT, signer_index 1 = COMPANY, anything else = OTHER
    await queryRunner.query(`
      UPDATE "tb_signatures"
      SET "signer_type" = CASE
        WHEN "signer_index" = 0 THEN 'CLIENT'::"tb_signatures_signer_type_enum"
        WHEN "signer_index" = 1 THEN 'COMPANY'::"tb_signatures_signer_type_enum"
        ELSE 'OTHER'::"tb_signatures_signer_type_enum"
      END
      WHERE "signer_type" IS NULL
    `);

    // Step 3: Fix inverted dates - swap signed_at between CLIENT and COMPANY
    // for contracts where they appear to be inverted
    // A signature pair is considered "inverted" if:
    // - Both signatures exist for same contract
    // - CLIENT signed_at is AFTER COMPANY signed_at (unusual)
    // - Both have non-null signed_at values

    await queryRunner.query(`
      WITH inverted_pairs AS (
        SELECT 
          c.idtb_contracts,
          c_sig.idtb_signatures as client_sig_id,
          c_sig."signed_at" as client_signed_at,
          co_sig.idtb_signatures as company_sig_id,
          co_sig."signed_at" as company_signed_at
        FROM "tb_signatures" c_sig
        JOIN "tb_signatures" co_sig ON c_sig."idtb_contracts" = co_sig."idtb_contracts"
        JOIN "tb_contracts" c ON c_sig."idtb_contracts" = c."idtb_contracts"
        WHERE c_sig."signer_type" = 'CLIENT'::"tb_signatures_signer_type_enum"
          AND co_sig."signer_type" = 'COMPANY'::"tb_signatures_signer_type_enum"
          AND c_sig."signed_at" IS NOT NULL
          AND co_sig."signed_at" IS NOT NULL
          AND c_sig."signed_at" > co_sig."signed_at"
          AND c."status" = 'signed'
      )
      UPDATE "tb_signatures" sig
      SET "signed_at" = CASE 
        WHEN sig."idtb_signatures" IN (SELECT client_sig_id FROM inverted_pairs) 
          THEN (SELECT company_signed_at FROM inverted_pairs WHERE client_sig_id = sig."idtb_signatures")
        WHEN sig."idtb_signatures" IN (SELECT company_sig_id FROM inverted_pairs)
          THEN (SELECT client_signed_at FROM inverted_pairs WHERE company_sig_id = sig."idtb_signatures")
        ELSE sig."signed_at"
      END
      WHERE sig."idtb_signatures" IN (
        SELECT client_sig_id FROM inverted_pairs 
        UNION ALL 
        SELECT company_sig_id FROM inverted_pairs
      )
    `);

    // Step 4: Also swap consent_at if it was inverted
    await queryRunner.query(`
      WITH inverted_pairs AS (
        SELECT 
          c.idtb_contracts,
          c_sig.idtb_signatures as client_sig_id,
          c_sig."consent_at" as client_consent_at,
          co_sig.idtb_signatures as company_sig_id,
          co_sig."consent_at" as company_consent_at
        FROM "tb_signatures" c_sig
        JOIN "tb_signatures" co_sig ON c_sig."idtb_contracts" = co_sig."idtb_contracts"
        JOIN "tb_contracts" c ON c_sig."idtb_contracts" = c."idtb_contracts"
        WHERE c_sig."signer_type" = 'CLIENT'::"tb_signatures_signer_type_enum"
          AND co_sig."signer_type" = 'COMPANY'::"tb_signatures_signer_type_enum"
          AND c_sig."consent_at" IS NOT NULL
          AND co_sig."consent_at" IS NOT NULL
          AND c_sig."consent_at" > co_sig."consent_at"
          AND c."status" = 'signed'
      )
      UPDATE "tb_signatures" sig
      SET "consent_at" = CASE 
        WHEN sig."idtb_signatures" IN (SELECT client_sig_id FROM inverted_pairs) 
          THEN (SELECT company_consent_at FROM inverted_pairs WHERE client_sig_id = sig."idtb_signatures")
        WHEN sig."idtb_signatures" IN (SELECT company_sig_id FROM inverted_pairs)
          THEN (SELECT client_consent_at FROM inverted_pairs WHERE company_sig_id = sig."idtb_signatures")
        ELSE sig."consent_at"
      END
      WHERE sig."idtb_signatures" IN (
        SELECT client_sig_id FROM inverted_pairs 
        UNION ALL 
        SELECT company_sig_id FROM inverted_pairs
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Swap dates back (restore inversion)
    await queryRunner.query(`
      WITH inverted_pairs AS (
        SELECT 
          c.idtb_contracts,
          c_sig.idtb_signatures as client_sig_id,
          c_sig."signed_at" as client_signed_at,
          co_sig.idtb_signatures as company_sig_id,
          co_sig."signed_at" as company_signed_at
        FROM "tb_signatures" c_sig
        JOIN "tb_signatures" co_sig ON c_sig."idtb_contracts" = co_sig."idtb_contracts"
        JOIN "tb_contracts" c ON c_sig."idtb_contracts" = c."idtb_contracts"
        WHERE c_sig."signer_type" = 'CLIENT'::"tb_signatures_signer_type_enum"
          AND co_sig."signer_type" = 'COMPANY'::"tb_signatures_signer_type_enum"
          AND c_sig."signed_at" IS NOT NULL
          AND co_sig."signed_at" IS NOT NULL
          AND c_sig."signed_at" < co_sig."signed_at"
          AND c."status" = 'signed'
      )
      UPDATE "tb_signatures" sig
      SET "signed_at" = CASE 
        WHEN sig."idtb_signatures" IN (SELECT client_sig_id FROM inverted_pairs) 
          THEN (SELECT company_signed_at FROM inverted_pairs WHERE client_sig_id = sig."idtb_signatures")
        WHEN sig."idtb_signatures" IN (SELECT company_sig_id FROM inverted_pairs)
          THEN (SELECT client_signed_at FROM inverted_pairs WHERE company_sig_id = sig."idtb_signatures")
        ELSE sig."signed_at"
      END
      WHERE sig."idtb_signatures" IN (
        SELECT client_sig_id FROM inverted_pairs 
        UNION ALL 
        SELECT company_sig_id FROM inverted_pairs
      )
    `);

    // Step 2: Remove signer_type column
    await queryRunner.query(`
      ALTER TABLE "tb_signatures" DROP COLUMN "signer_type"
    `);

    // Step 3: Remove enum type
    await queryRunner.query(`
      DROP TYPE "tb_signatures_signer_type_enum"
    `);
  }
}
