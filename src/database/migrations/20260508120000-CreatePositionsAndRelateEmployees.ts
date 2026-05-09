import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePositionsAndRelateEmployees20260508120000 implements MigrationInterface {
  name = "CreatePositionsAndRelateEmployees20260508120000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasUsersTable = await queryRunner.hasTable("tb_users");
    if (!hasUsersTable) {
      return;
    }

    const hasPositionsTable = await queryRunner.hasTable("tb_positions");

    if (!hasPositionsTable) {
      await queryRunner.query(`
        CREATE TABLE tb_positions (
          idtb_positions uuid PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),
          idtb_users uuid NOT NULL,
          name varchar(120) NOT NULL,
          normalized_name varchar(120) NOT NULL,
          is_active boolean NOT NULL DEFAULT true,
          created_at timestamp NOT NULL DEFAULT now(),
          updated_at timestamp NOT NULL DEFAULT now(),
          CONSTRAINT FK_tb_positions_users FOREIGN KEY (idtb_users)
            REFERENCES tb_users(idtb_users)
            ON DELETE CASCADE
        )
      `);

      await queryRunner.query(`
        CREATE UNIQUE INDEX UQ_tb_positions_user_normalized_name
          ON tb_positions (idtb_users, normalized_name)
      `);

      await queryRunner.query(`
        CREATE INDEX IDX_tb_positions_users
          ON tb_positions (idtb_users)
      `);
    }

    const hasEmployeesTable = await queryRunner.hasTable("tb_employees");
    if (!hasEmployeesTable) {
      return;
    }

    const hasEmployeePositionText = await queryRunner.hasColumn(
      "tb_employees",
      "position",
    );
    const hasEmployeePositionId = await queryRunner.hasColumn(
      "tb_employees",
      "idtb_positions",
    );

    if (!hasEmployeePositionId) {
      await queryRunner.query(`
        ALTER TABLE tb_employees
        ADD COLUMN idtb_positions uuid
      `);
    }

    if (hasEmployeePositionText) {
      await queryRunner.query(`
        INSERT INTO tb_positions (
          idtb_users,
          name,
          normalized_name,
          is_active,
          created_at,
          updated_at
        )
        SELECT DISTINCT
          e.idtb_users,
          trim(e.position),
          lower(trim(regexp_replace(e.position, '\\s+', ' ', 'g'))),
          true,
          now(),
          now()
        FROM tb_employees e
        WHERE e.position IS NOT NULL
          AND trim(e.position) <> ''
        ON CONFLICT (idtb_users, normalized_name) DO NOTHING
      `);

      await queryRunner.query(`
        UPDATE tb_employees e
        SET idtb_positions = p.idtb_positions
        FROM tb_positions p
        WHERE p.idtb_users = e.idtb_users
          AND p.normalized_name = lower(trim(regexp_replace(e.position, '\\s+', ' ', 'g')))
          AND e.idtb_positions IS NULL
      `);
    }

    await queryRunner.query(`
      INSERT INTO tb_positions (
        idtb_users,
        name,
        normalized_name,
        is_active,
        created_at,
        updated_at
      )
      SELECT DISTINCT
        e.idtb_users,
        'Sem cargo',
        'sem cargo',
        true,
        now(),
        now()
      FROM tb_employees e
      WHERE e.idtb_positions IS NULL
      ON CONFLICT (idtb_users, normalized_name) DO NOTHING
    `);

    await queryRunner.query(`
      UPDATE tb_employees e
      SET idtb_positions = p.idtb_positions
      FROM tb_positions p
      WHERE p.idtb_users = e.idtb_users
        AND p.normalized_name = 'sem cargo'
        AND e.idtb_positions IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE tb_employees
      ALTER COLUMN idtb_positions SET NOT NULL
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_tb_employees_positions'
        ) THEN
          ALTER TABLE tb_employees
          ADD CONSTRAINT FK_tb_employees_positions
          FOREIGN KEY (idtb_positions)
          REFERENCES tb_positions(idtb_positions)
          ON DELETE RESTRICT;
        END IF;
      END $$
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS IDX_tb_employees_positions
        ON tb_employees (idtb_positions)
    `);

    if (hasEmployeePositionText) {
      await queryRunner.query(`
        ALTER TABLE tb_employees
        DROP COLUMN position
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasEmployeesTable = await queryRunner.hasTable("tb_employees");

    if (hasEmployeesTable) {
      const hasEmployeePositionText = await queryRunner.hasColumn(
        "tb_employees",
        "position",
      );
      const hasEmployeePositionId = await queryRunner.hasColumn(
        "tb_employees",
        "idtb_positions",
      );

      if (!hasEmployeePositionText) {
        await queryRunner.query(`
          ALTER TABLE tb_employees
          ADD COLUMN position varchar(100)
        `);
      }

      if (hasEmployeePositionId) {
        await queryRunner.query(`
          UPDATE tb_employees e
          SET position = COALESCE(p.name, 'Sem cargo')
          FROM tb_positions p
          WHERE p.idtb_positions = e.idtb_positions
        `);

        await queryRunner.query(`
          UPDATE tb_employees
          SET position = 'Sem cargo'
          WHERE position IS NULL OR trim(position) = ''
        `);

        await queryRunner.query(`
          ALTER TABLE tb_employees
          ALTER COLUMN position SET NOT NULL
        `);

        await queryRunner.query(`
          DROP INDEX IF EXISTS IDX_tb_employees_positions
        `);

        await queryRunner.query(`
          ALTER TABLE tb_employees
          DROP CONSTRAINT IF EXISTS FK_tb_employees_positions
        `);

        await queryRunner.query(`
          ALTER TABLE tb_employees
          DROP COLUMN idtb_positions
        `);
      }
    }

    const hasPositionsTable = await queryRunner.hasTable("tb_positions");
    if (hasPositionsTable) {
      await queryRunner.query(`
        DROP TABLE tb_positions
      `);
    }
  }
}
