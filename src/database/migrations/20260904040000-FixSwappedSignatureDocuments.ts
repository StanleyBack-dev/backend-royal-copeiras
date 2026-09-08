import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Data fix for a bug in CreateSignatureRequestService that existed before
 * commit 4059464 (2026-04-23): the very first implementation created every
 * signature row (client AND company) using `input.signers[0]` unconditionally,
 * regardless of which signer the row actually represented. In practice this
 * meant the CLIENT row ended up with the COMPANY's configured identifier
 * (CONTRACT_COMPANY_SIGNER_IDENTIFIER) and the COMPANY row ended up with the
 * CLIENT's own document — the two are swapped relative to signer_type.
 *
 * The webhook processor (ProcessSignatureWebhookService) later corrects
 * signed_by_name/signed_by_email from provider callbacks, but it never
 * touches signed_by_document, so the swapped value survives indefinitely on
 * rows created under the old code path.
 *
 * This migration repairs existing rows: for every contract with exactly one
 * CLIENT and one COMPANY signature, if the CLIENT row's document equals the
 * configured company identifier and the COMPANY row's does not, the two
 * documents are swapped back.
 *
 * Requires CONTRACT_COMPANY_SIGNER_IDENTIFIER to be set; if it isn't, this
 * migration is a no-op (nothing to safely compare against).
 */
export class FixSwappedSignatureDocuments20260904040000 implements MigrationInterface {
  name = "FixSwappedSignatureDocuments20260904040000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const companyIdentifier = process.env.CONTRACT_COMPANY_SIGNER_IDENTIFIER;
    if (!companyIdentifier || !companyIdentifier.trim()) {
      return;
    }

    await queryRunner.query(
      `
      WITH swapped_pairs AS (
        SELECT
          c_sig."idtb_signatures" AS client_sig_id,
          c_sig."signed_by_document" AS client_document,
          co_sig."idtb_signatures" AS company_sig_id,
          co_sig."signed_by_document" AS company_document
        FROM "tb_signatures" c_sig
        JOIN "tb_signatures" co_sig
          ON c_sig."idtb_contracts" = co_sig."idtb_contracts"
        WHERE c_sig."signer_type" = 'CLIENT'::"tb_signatures_signer_type_enum"
          AND co_sig."signer_type" = 'COMPANY'::"tb_signatures_signer_type_enum"
          AND c_sig."signed_by_document" = $1
          AND (
            co_sig."signed_by_document" IS NULL
            OR co_sig."signed_by_document" != $1
          )
      )
      UPDATE "tb_signatures" sig
      SET "signed_by_document" = CASE
        WHEN sig."idtb_signatures" IN (SELECT client_sig_id FROM swapped_pairs)
          THEN (SELECT company_document FROM swapped_pairs WHERE client_sig_id = sig."idtb_signatures")
        WHEN sig."idtb_signatures" IN (SELECT company_sig_id FROM swapped_pairs)
          THEN (SELECT client_document FROM swapped_pairs WHERE company_sig_id = sig."idtb_signatures")
        ELSE sig."signed_by_document"
      END
      WHERE sig."idtb_signatures" IN (
        SELECT client_sig_id FROM swapped_pairs
        UNION ALL
        SELECT company_sig_id FROM swapped_pairs
      )
      `,
      [companyIdentifier],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const companyIdentifier = process.env.CONTRACT_COMPANY_SIGNER_IDENTIFIER;
    if (!companyIdentifier || !companyIdentifier.trim()) {
      return;
    }

    // Best-effort reversal: swap back rows currently matching the fixed
    // state (COMPANY holds the company identifier, CLIENT holds something
    // else). This restores the pre-fix layout for rows this migration
    // touched, but cannot distinguish them from rows that were already
    // correct on their own, so it is not a perfect inverse.
    await queryRunner.query(
      `
      WITH swapped_pairs AS (
        SELECT
          c_sig."idtb_signatures" AS client_sig_id,
          c_sig."signed_by_document" AS client_document,
          co_sig."idtb_signatures" AS company_sig_id,
          co_sig."signed_by_document" AS company_document
        FROM "tb_signatures" c_sig
        JOIN "tb_signatures" co_sig
          ON c_sig."idtb_contracts" = co_sig."idtb_contracts"
        WHERE c_sig."signer_type" = 'CLIENT'::"tb_signatures_signer_type_enum"
          AND co_sig."signer_type" = 'COMPANY'::"tb_signatures_signer_type_enum"
          AND co_sig."signed_by_document" = $1
          AND (
            c_sig."signed_by_document" IS NULL
            OR c_sig."signed_by_document" != $1
          )
      )
      UPDATE "tb_signatures" sig
      SET "signed_by_document" = CASE
        WHEN sig."idtb_signatures" IN (SELECT client_sig_id FROM swapped_pairs)
          THEN (SELECT company_document FROM swapped_pairs WHERE client_sig_id = sig."idtb_signatures")
        WHEN sig."idtb_signatures" IN (SELECT company_sig_id FROM swapped_pairs)
          THEN (SELECT client_document FROM swapped_pairs WHERE company_sig_id = sig."idtb_signatures")
        ELSE sig."signed_by_document"
      END
      WHERE sig."idtb_signatures" IN (
        SELECT client_sig_id FROM swapped_pairs
        UNION ALL
        SELECT company_sig_id FROM swapped_pairs
      )
      `,
      [companyIdentifier],
    );
  }
}
