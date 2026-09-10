import { In, Repository } from "typeorm";
import { AppException } from "../../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../../common/exceptions/app-errors.catalog";
import { PositionsEntity } from "../../../positions/entities/positions.entity";
import { SuppliesEntity } from "../../../supplies/entities/supplies.entity";
import { BudgetItemType } from "../../enums/budget-item-type.enum";
import {
  inferServiceComboFromDescription,
  normalizeGenderToEnglish,
} from "../../constants/budget-service-types.constant";

export interface RawBudgetItem {
  itemType?: BudgetItemType | null;
  idPositions?: string | null;
  idSupplies?: string | null;
  unit?: string | null;
  description?: string | null;
  gender?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  notes?: string | null;
  sortOrder?: number | null;
  eventDateIndex?: number | null;
}

export interface NormalizedBudgetItem {
  itemType: BudgetItemType;
  idPositions: string | null;
  idSupplies: string | null;
  unit: string | null;
  description: string;
  serviceGender: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  sortOrder: number;
  eventDateIndex: number;
}

export function resolveItemType(item: RawBudgetItem): BudgetItemType {
  return item.itemType === BudgetItemType.SUPPLY
    ? BudgetItemType.SUPPLY
    : BudgetItemType.LABOR;
}

export function isSupplyItem(item: RawBudgetItem): boolean {
  return resolveItemType(item) === BudgetItemType.SUPPLY;
}

function resolveServiceGender(item: RawBudgetItem): string | null {
  const explicit = normalizeGenderToEnglish(item.gender?.toString().trim());
  if (explicit) {
    return explicit;
  }

  const inferred = inferServiceComboFromDescription(
    item.description ?? undefined,
  );
  if (inferred) {
    const parts = inferred.split(":");
    return normalizeGenderToEnglish(parts.length > 1 ? parts[1] : undefined);
  }

  return null;
}

/**
 * Per-day uniqueness key. LABOR keys are namespaced by `L::` and SUPPLY by
 * `S::` so a cargo and a material never collide with each other.
 */
export function buildItemUniquenessKey(item: RawBudgetItem): string {
  const day = `${item.eventDateIndex ?? 0}`;

  if (isSupplyItem(item)) {
    const key =
      item.idSupplies?.trim() || (item.description ?? "").trim().toLowerCase();
    return `S::${day}::${key}`;
  }

  const gender = resolveServiceGender(item) ?? "";
  const position = item.idPositions?.trim() || "";
  if (gender) {
    return `L::${day}::${position}::${gender}`;
  }
  return `L::${day}::${position}::${(item.description ?? "").trim().toLowerCase()}`;
}

/** Validates the identity fields of each item according to its type. */
export function assertItemsShape(items: RawBudgetItem[]): void {
  const hasInvalidLabor = items.some(
    (item) => !isSupplyItem(item) && !item.idPositions?.trim(),
  );
  if (hasInvalidLabor) {
    throw AppException.from(
      APP_ERRORS.budgets.itemServiceTypeInvalid,
      undefined,
    );
  }

  const hasInvalidSupply = items.some(
    (item) =>
      isSupplyItem(item) &&
      !item.idSupplies?.trim() &&
      !item.description?.trim(),
  );
  if (hasInvalidSupply) {
    throw AppException.from(APP_ERRORS.budgets.itemSupplyInvalid, undefined);
  }
}

/** Checks per-day duplication, keyed separately for LABOR and SUPPLY. */
export function assertItemsNotDuplicated(items: RawBudgetItem[]): void {
  const keys = items.map((item) => buildItemUniquenessKey(item));
  const unique = new Set(keys);
  if (unique.size === keys.length) {
    return;
  }

  const supplyKeys = items.filter(isSupplyItem).map(buildItemUniquenessKey);
  if (new Set(supplyKeys).size !== supplyKeys.length) {
    throw AppException.from(APP_ERRORS.budgets.itemSupplyDuplicated, undefined);
  }

  throw AppException.from(
    APP_ERRORS.budgets.itemServiceTypeDuplicated,
    undefined,
  );
}

export async function loadAndAssertPositions(
  items: RawBudgetItem[],
  positionsRepo: Repository<PositionsEntity>,
): Promise<Map<string, PositionsEntity>> {
  const positionIds = Array.from(
    new Set(
      items
        .filter((item) => !isSupplyItem(item) && item.idPositions)
        .map((item) => item.idPositions as string),
    ),
  );

  if (!positionIds.length) {
    return new Map();
  }

  const positions = await positionsRepo.find({
    where: { idPositions: In(positionIds) },
  });
  const byId = new Map(positions.map((p) => [p.idPositions, p]));

  if (positionIds.some((id) => !byId.has(id))) {
    throw AppException.from(APP_ERRORS.positions.notFound, undefined);
  }
  if (positionIds.some((id) => !byId.get(id)?.isActive)) {
    throw AppException.from(APP_ERRORS.positions.inactive, undefined);
  }

  return byId;
}

export async function loadAndAssertSupplies(
  items: RawBudgetItem[],
  suppliesRepo: Repository<SuppliesEntity>,
): Promise<Map<string, SuppliesEntity>> {
  const supplyIds = Array.from(
    new Set(
      items
        .filter((item) => isSupplyItem(item) && item.idSupplies)
        .map((item) => item.idSupplies as string),
    ),
  );

  if (!supplyIds.length) {
    return new Map();
  }

  const supplies = await suppliesRepo.find({
    where: { idSupplies: In(supplyIds) },
  });
  const byId = new Map(supplies.map((s) => [s.idSupplies, s]));

  if (supplyIds.some((id) => !byId.has(id))) {
    throw AppException.from(APP_ERRORS.budgets.itemSupplyNotFound, undefined);
  }
  if (supplyIds.some((id) => !byId.get(id)?.isActive)) {
    throw AppException.from(APP_ERRORS.budgets.itemSupplyInactive, undefined);
  }

  return byId;
}

export function normalizeBudgetItem(
  item: RawBudgetItem,
  index: number,
): NormalizedBudgetItem {
  const quantity = Number(item.quantity ?? 0);
  const unitPrice = Number(item.unitPrice ?? 0);
  const totalPrice = Number((quantity * unitPrice).toFixed(2));
  const supply = isSupplyItem(item);

  return {
    itemType: supply ? BudgetItemType.SUPPLY : BudgetItemType.LABOR,
    idPositions: supply ? null : (item.idPositions ?? null),
    idSupplies: supply ? (item.idSupplies ?? null) : null,
    unit: supply ? item.unit?.trim() || null : null,
    description: (item.description ?? "").trim(),
    serviceGender: supply ? null : resolveServiceGender(item),
    quantity,
    unitPrice,
    totalPrice,
    notes: item.notes ?? undefined,
    sortOrder: item.sortOrder ?? index,
    eventDateIndex: item.eventDateIndex ?? 0,
  };
}

/**
 * Normalizes every item and, for catalog-linked SUPPLY lines, makes the unit of
 * measure and the material name authoritative from `tb_supplies` — the budget
 * form shows the unit as a locked field, so the source of truth is the catalog,
 * not whatever the client posted. The unit price stays as posted (each budget
 * may override the suggested price without touching the catalog).
 */
export function normalizeBudgetItems(
  items: RawBudgetItem[],
  suppliesById: Map<string, SuppliesEntity>,
): NormalizedBudgetItem[] {
  return items.map((item, index) => {
    const normalized = normalizeBudgetItem(item, index);

    if (
      normalized.itemType === BudgetItemType.SUPPLY &&
      normalized.idSupplies
    ) {
      const supply = suppliesById.get(normalized.idSupplies);
      if (supply) {
        normalized.unit = supply.defaultUnit?.trim() || normalized.unit;
        normalized.description = supply.name?.trim() || normalized.description;
      }
    }

    return normalized;
  });
}
