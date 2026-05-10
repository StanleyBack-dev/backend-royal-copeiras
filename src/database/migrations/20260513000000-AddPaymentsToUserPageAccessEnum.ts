import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentsToUserPageAccessEnum20260513000000 implements MigrationInterface {
  name = "AddPaymentsToUserPageAccessEnum20260513000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_namespace n ON n.oid = t.typnamespace
          WHERE n.nspname = 'public'
            AND t.typname = 'tb_user_page_access_page_key_enum'
        ) THEN
          IF NOT EXISTS (
            SELECT 1
            FROM pg_enum e
            JOIN pg_type t ON t.oid = e.enumtypid
            JOIN pg_namespace n ON n.oid = t.typnamespace
            WHERE n.nspname = 'public'
              AND t.typname = 'tb_user_page_access_page_key_enum'
              AND e.enumlabel = 'PAYMENTS'
          ) THEN
            ALTER TYPE "tb_user_page_access_page_key_enum" ADD VALUE 'PAYMENTS';
          END IF;
        END IF;
      END $$
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    // PostgreSQL does not support dropping enum values safely across versions.
  }
}
