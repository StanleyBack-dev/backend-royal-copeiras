import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Consumables must never become event staffing slots.
 *
 * - Before the supplies catalog existed, "Papel Higiênico e Papel Toalha" was
 *   registered as a position (cargo), so budgets billed it as a LABOR line and
 *   signed events got an allocation slot for it. The position is deactivated so
 *   new budgets use the supplies catalog instead; old budgets and contracts keep
 *   the line untouched (they are signed documents).
 * - Empty allocation slots (no employee, nothing paid) created for that legacy
 *   position or for SUPPLY budget lines are removed. Slots that already hold an
 *   employee or a payment are left alone so no team cost silently disappears.
 *
 * `down` reactivates the position; removed empty slots are not recreated, as
 * they carried no data.
 */
const LEGACY_SUPPLY_POSITION_NORMALIZED_NAME = "papel higienico e papel toalha";

export class RemoveStaffSlotsForSupplyItems20261015110000 implements MigrationInterface {
  name = "RemoveStaffSlotsForSupplyItems20261015110000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTables =
      (await queryRunner.hasTable("tb_event_assignments")) &&
      (await queryRunner.hasTable("tb_budget_items")) &&
      (await queryRunner.hasTable("tb_positions"));
    if (!hasTables) {
      return;
    }

    await queryRunner.query(
      `
        DELETE FROM tb_event_assignments ea
        USING tb_budget_items bi
        LEFT JOIN tb_positions p ON p.idtb_positions = bi.idtb_positions
        WHERE ea.idtb_budget_items = bi.idtb_budget_items
          AND ea.idtb_employees IS NULL
          AND ea.employee_payment = 0
          AND (
            bi.item_type = 'SUPPLY'
            OR p.normalized_name = $1
          )
      `,
      [LEGACY_SUPPLY_POSITION_NORMALIZED_NAME],
    );

    await queryRunner.query(
      `
        UPDATE tb_positions
        SET is_active = false, updated_at = now()
        WHERE normalized_name = $1
          AND is_active = true
      `,
      [LEGACY_SUPPLY_POSITION_NORMALIZED_NAME],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable("tb_positions"))) {
      return;
    }

    await queryRunner.query(
      `
        UPDATE tb_positions
        SET is_active = true, updated_at = now()
        WHERE normalized_name = $1
      `,
      [LEGACY_SUPPLY_POSITION_NORMALIZED_NAME],
    );
  }
}
