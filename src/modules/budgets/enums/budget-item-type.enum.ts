import { registerEnumType } from "@nestjs/graphql";

/**
 * Discriminates a budget line between staffing (a `tb_positions` cargo, priced
 * per professional) and a material/consumable supply (a `tb_supplies` catalog
 * entry, priced per unit). Kept as a plain string column — no PG enum — so new
 * kinds never need a type migration.
 */
export enum BudgetItemType {
  LABOR = "LABOR",
  SUPPLY = "SUPPLY",
}

export const BUDGET_ITEM_TYPES = Object.values(BudgetItemType);

registerEnumType(BudgetItemType, {
  name: "BudgetItemType",
});
