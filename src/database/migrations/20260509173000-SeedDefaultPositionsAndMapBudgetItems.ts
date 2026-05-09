import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDefaultPositionsAndMapBudgetItems20260509173000 implements MigrationInterface {
  name = "SeedDefaultPositionsAndMapBudgetItems20260509173000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasPositionsTable = await queryRunner.hasTable("tb_positions");
    const hasBudgetItemsTable = await queryRunner.hasTable("tb_budget_items");

    if (!hasPositionsTable || !hasBudgetItemsTable) {
      return;
    }

    const hasBudgetItemsPositionColumn = await queryRunner.hasColumn(
      "tb_budget_items",
      "idtb_positions",
    );

    if (!hasBudgetItemsPositionColumn) {
      return;
    }

    const idUsers = "499cb4b5-2580-43ef-8a2b-c70aac2c80f5";

    await queryRunner.query(`
      INSERT INTO tb_positions (
        idtb_users,
        name,
        normalized_name,
        is_active,
        created_at,
        updated_at
      )
      SELECT
        seeded.idtb_users,
        seeded.name,
        seeded.normalized_name,
        seeded.is_active,
        now(),
        now()
      FROM (
        VALUES
          ('${idUsers}'::uuid, 'Copeira', 'copeira', true),
          ('${idUsers}'::uuid, 'Garçom', 'garcom', true),
          ('${idUsers}'::uuid, 'Segurança', 'seguranca', true),
          ('${idUsers}'::uuid, 'Recepcionista', 'recepcionista', true),
          ('${idUsers}'::uuid, 'Monitor', 'monitor', true)
      ) AS seeded(idtb_users, name, normalized_name, is_active)
      WHERE NOT EXISTS (
        SELECT 1
        FROM tb_positions position
        WHERE position.idtb_users = seeded.idtb_users
          AND position.normalized_name = seeded.normalized_name
      )
    `);

    await queryRunner.query(`
      WITH normalized_items AS (
        SELECT
          item.idtb_budget_items,
          CASE
            WHEN normalized_description LIKE '%garcom%'
              OR normalized_description LIKE '%garcons%'
              OR normalized_description LIKE '%garconete%'
              OR normalized_description LIKE '%garconetes%'
              THEN 'garcom'
            WHEN normalized_description LIKE '%copeira%'
              OR normalized_description LIKE '%copeiras%'
              OR normalized_description LIKE '%copeiro%'
              OR normalized_description LIKE '%copeiros%'
              THEN 'copeira'
            WHEN normalized_description LIKE '%seguranca%'
              OR normalized_description LIKE '%segurancas%'
              THEN 'seguranca'
            WHEN normalized_description LIKE '%recepcionista%'
              OR normalized_description LIKE '%recepcionistas%'
              THEN 'recepcionista'
            WHEN normalized_description LIKE '%monitor%'
              OR normalized_description LIKE '%monitores%'
              OR normalized_description LIKE '%monitora%'
              OR normalized_description LIKE '%monitoras%'
              THEN 'monitor'
            ELSE NULL
          END AS inferred_normalized_name
        FROM (
          SELECT
            item.idtb_budget_items,
            lower(
              trim(
                regexp_replace(
                  translate(
                    coalesce(item.description, ''),
                    'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇç',
                    'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCc'
                  ),
                  '\\s+',
                  ' ',
                  'g'
                )
              )
            ) AS normalized_description
          FROM tb_budget_items item
          WHERE item.idtb_positions IS NULL
        ) item
      )
      UPDATE tb_budget_items item
      SET idtb_positions = position.idtb_positions
      FROM normalized_items normalized
      INNER JOIN tb_positions position
        ON position.idtb_users = '${idUsers}'::uuid
       AND position.normalized_name = normalized.inferred_normalized_name
      WHERE item.idtb_budget_items = normalized.idtb_budget_items
        AND item.idtb_positions IS NULL
        AND normalized.inferred_normalized_name IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasPositionsTable = await queryRunner.hasTable("tb_positions");
    const hasBudgetItemsTable = await queryRunner.hasTable("tb_budget_items");

    if (!hasPositionsTable || !hasBudgetItemsTable) {
      return;
    }

    const hasBudgetItemsPositionColumn = await queryRunner.hasColumn(
      "tb_budget_items",
      "idtb_positions",
    );

    if (hasBudgetItemsPositionColumn) {
      await queryRunner.query(`
        UPDATE tb_budget_items item
        SET idtb_positions = NULL
        FROM tb_positions position
        WHERE item.idtb_positions = position.idtb_positions
          AND position.idtb_users = '499cb4b5-2580-43ef-8a2b-c70aac2c80f5'::uuid
          AND position.normalized_name IN (
            'copeira',
            'garcom',
            'seguranca',
            'recepcionista',
            'monitor'
          )
      `);
    }

    await queryRunner.query(`
      DELETE FROM tb_positions
      WHERE idtb_users = '499cb4b5-2580-43ef-8a2b-c70aac2c80f5'::uuid
        AND normalized_name IN (
          'copeira',
          'garcom',
          'seguranca',
          'recepcionista',
          'monitor'
        )
    `);
  }
}
