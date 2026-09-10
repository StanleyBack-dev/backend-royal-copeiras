import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Catalog of non-labor budget line items (papel higiênico, papel toalha,
 * copos descartáveis, …) — the counterpart of tb_positions for the SUPPLY
 * item type in tb_budget_items.
 */
export class CreateSuppliesTable20260908120000 implements MigrationInterface {
  name = "CreateSuppliesTable20260908120000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable("tb_supplies");
    if (hasTable) {
      return;
    }

    await queryRunner.query(`
      CREATE TABLE tb_supplies (
        idtb_supplies uuid PRIMARY KEY DEFAULT (md5(random()::text || clock_timestamp()::text)::uuid),
        idtb_users uuid NOT NULL REFERENCES tb_users(idtb_users) ON DELETE CASCADE,
        name varchar(120) NOT NULL,
        normalized_name varchar(120) NOT NULL,
        default_unit varchar(32),
        suggested_unit_price numeric(12,2),
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_tb_supplies_user_normalized_name"
        ON tb_supplies (idtb_users, normalized_name)
    `);

    await queryRunner.query(`
      INSERT INTO tb_supplies (idtb_users, name, normalized_name, default_unit)
      SELECT u.idtb_users, seed.name, seed.normalized_name, seed.default_unit
      FROM (
        SELECT idtb_users
        FROM tb_users
        ORDER BY created_at ASC
        LIMIT 1
      ) u
      CROSS JOIN (
        VALUES
          ('Papel higiênico', 'papel higienico', 'rolo'),
          ('Papel toalha', 'papel toalha', 'pacote'),
          ('Sabonete líquido', 'sabonete liquido', 'unidade'),
          ('Álcool em gel', 'alcool em gel', 'unidade'),
          ('Copos descartáveis', 'copos descartaveis', 'pacote')
      ) AS seed(name, normalized_name, default_unit)
      WHERE EXISTS (SELECT 1 FROM tb_users)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS tb_supplies CASCADE`);
  }
}
