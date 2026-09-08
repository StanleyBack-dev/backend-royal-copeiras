import { EntityManager } from "typeorm";

/**
 * Shared by any budget-creation path (the authenticated create flow and the
 * public intake flow) so numbering stays sequential and collision-free
 * regardless of which one inserted the row.
 */
export async function generateBudgetNumber(
  manager: EntityManager,
): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `ORC-${year}`;

  // Acquire an advisory lock per year to avoid race conditions when generating numbers
  // This runs inside the outer transaction so the lock is released at transaction end
  await manager.query("SELECT pg_advisory_xact_lock($1)", [Number(year)]);

  // Use the maximum existing numeric suffix to avoid duplicates when rows were deleted
  const raw = await manager.query(
    `SELECT COALESCE(MAX(NULLIF(split_part(budget_number, '-', 3), '')::int), 0) AS max_num
     FROM tb_budgets
     WHERE budget_number LIKE $1`,
    [`${prefix}-%`],
  );

  const maxNum = raw?.[0]?.max_num ?? 0;
  const sequence = String(Number(maxNum) + 1).padStart(5, "0");
  return `${prefix}-${sequence}`;
}
