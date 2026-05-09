import { MigrationInterface, QueryRunner } from "typeorm";

export class BackfillBudgetItemsPositions20260509113000 implements MigrationInterface {
  name = "BackfillBudgetItemsPositions20260509113000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBudgetItemsTable = await queryRunner.hasTable("tb_budget_items");
    const hasBudgetsTable = await queryRunner.hasTable("tb_budgets");
    const hasPositionsTable = await queryRunner.hasTable("tb_positions");

    if (!hasBudgetItemsTable || !hasBudgetsTable || !hasPositionsTable) {
      return;
    }

    const hasPositionColumn = await queryRunner.hasColumn(
      "tb_budget_items",
      "idtb_positions",
    );

    if (!hasPositionColumn) {
      return;
    }

    await queryRunner.query(`
      WITH inferred_budget_items AS (
        SELECT DISTINCT
          budget.idtb_users,
          CASE
            WHEN normalized_description LIKE '%garcom%'
              OR normalized_description LIKE '%garcons%'
              OR normalized_description LIKE '%garconete%'
              OR normalized_description LIKE '%garconetes%'
              THEN 'Garçom'
            WHEN normalized_description LIKE '%copeira%'
              OR normalized_description LIKE '%copeiras%'
              OR normalized_description LIKE '%copeiro%'
              OR normalized_description LIKE '%copeiros%'
              THEN 'Copeira'
            WHEN normalized_description LIKE '%porteiro%'
              OR normalized_description LIKE '%porteiros%'
              OR normalized_description LIKE '%porteira%'
              OR normalized_description LIKE '%porteiras%'
              THEN 'Porteiro'
            WHEN normalized_description LIKE '%seguranca%'
              OR normalized_description LIKE '%segurancas%'
              THEN 'Segurança'
            WHEN normalized_description LIKE '%monitor%'
              OR normalized_description LIKE '%monitores%'
              OR normalized_description LIKE '%monitora%'
              OR normalized_description LIKE '%monitoras%'
              THEN 'Monitor'
            WHEN normalized_description LIKE '%recepcionista%'
              OR normalized_description LIKE '%recepcionistas%'
              THEN 'Recepcionista'
            ELSE NULL
          END AS position_name,
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
            WHEN normalized_description LIKE '%porteiro%'
              OR normalized_description LIKE '%porteiros%'
              OR normalized_description LIKE '%porteira%'
              OR normalized_description LIKE '%porteiras%'
              THEN 'porteiro'
            WHEN normalized_description LIKE '%seguranca%'
              OR normalized_description LIKE '%segurancas%'
              THEN 'seguranca'
            WHEN normalized_description LIKE '%monitor%'
              OR normalized_description LIKE '%monitores%'
              OR normalized_description LIKE '%monitora%'
              OR normalized_description LIKE '%monitoras%'
              THEN 'monitor'
            WHEN normalized_description LIKE '%recepcionista%'
              OR normalized_description LIKE '%recepcionistas%'
              THEN 'recepcionista'
            ELSE NULL
          END AS normalized_name
        FROM (
          SELECT
            item.idtb_budget_items,
            budget.idtb_users,
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
          INNER JOIN tb_budgets budget
            ON budget.idtb_budgets = item.idtb_budgets
          WHERE item.idtb_positions IS NULL
        ) budget
      )
      INSERT INTO tb_positions (
        idtb_users,
        name,
        normalized_name,
        is_active,
        created_at,
        updated_at
      )
      SELECT DISTINCT
        inferred.idtb_users,
        inferred.position_name,
        inferred.normalized_name,
        true,
        now(),
        now()
      FROM inferred_budget_items inferred
      WHERE inferred.position_name IS NOT NULL
        AND inferred.normalized_name IS NOT NULL
      ON CONFLICT (idtb_users, normalized_name) DO NOTHING
    `);

    await queryRunner.query(`
      WITH inferred_budget_items AS (
        SELECT
          item.idtb_budget_items,
          budget.idtb_users,
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
            WHEN normalized_description LIKE '%porteiro%'
              OR normalized_description LIKE '%porteiros%'
              OR normalized_description LIKE '%porteira%'
              OR normalized_description LIKE '%porteiras%'
              THEN 'porteiro'
            WHEN normalized_description LIKE '%seguranca%'
              OR normalized_description LIKE '%segurancas%'
              THEN 'seguranca'
            WHEN normalized_description LIKE '%monitor%'
              OR normalized_description LIKE '%monitores%'
              OR normalized_description LIKE '%monitora%'
              OR normalized_description LIKE '%monitoras%'
              THEN 'monitor'
            WHEN normalized_description LIKE '%recepcionista%'
              OR normalized_description LIKE '%recepcionistas%'
              THEN 'recepcionista'
            ELSE NULL
          END AS normalized_name
        FROM (
          SELECT
            item.idtb_budget_items,
            budget.idtb_users,
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
          INNER JOIN tb_budgets budget
            ON budget.idtb_budgets = item.idtb_budgets
          WHERE item.idtb_positions IS NULL
        ) budget
      )
      UPDATE tb_budget_items item
      SET idtb_positions = position.idtb_positions
      FROM inferred_budget_items inferred
      INNER JOIN tb_positions position
        ON position.idtb_users = inferred.idtb_users
       AND position.normalized_name = inferred.normalized_name
      WHERE item.idtb_budget_items = inferred.idtb_budget_items
        AND item.idtb_positions IS NULL
        AND inferred.normalized_name IS NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    void queryRunner;
    return;
  }
}
