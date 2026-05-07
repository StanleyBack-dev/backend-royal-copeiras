import { MigrationInterface, QueryRunner } from "typeorm";

export class AddClosedWithoutSignatureContractStatus20260506195500 implements MigrationInterface {
  name = "AddClosedWithoutSignatureContractStatus20260506195500";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."tb_contracts_status_enum"
      ADD VALUE IF NOT EXISTS 'closed_without_signature';
    `);
  }

  public async down(): Promise<void> {
    // PostgreSQL does not support removing enum values in a safe, simple way.
  }
}
