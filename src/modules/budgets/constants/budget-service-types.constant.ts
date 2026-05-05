export const BUDGET_ALLOWED_SERVICE_TYPES = [
  "garcom",
  "copeira",
  "porteiro",
  "seguranca",
  "monitor",
  "recepcionista",
] as const;

export type BudgetServiceType = (typeof BUDGET_ALLOWED_SERVICE_TYPES)[number];

/**
 * Gendered variants for each base service type.
 * Each entry: [normalizedKeyword, comboKey]
 * comboKey uniquely identifies a (type × gender) combination.
 */
const BUDGET_SERVICE_KEYWORDS: readonly {
  keyword: string;
  type: BudgetServiceType;
  combo: string;
}[] = [
  // garcom
  { keyword: "garcom", type: "garcom", combo: "garcom:masculino" },
  { keyword: "garcons", type: "garcom", combo: "garcom:masculino" },
  { keyword: "garconete", type: "garcom", combo: "garcom:feminino" },
  { keyword: "garconetes", type: "garcom", combo: "garcom:feminino" },
  // copeira
  { keyword: "copeiro", type: "copeira", combo: "copeira:masculino" },
  { keyword: "copeiros", type: "copeira", combo: "copeira:masculino" },
  { keyword: "copeira", type: "copeira", combo: "copeira:feminino" },
  { keyword: "copeiras", type: "copeira", combo: "copeira:feminino" },
  // porteiro
  { keyword: "porteiro", type: "porteiro", combo: "porteiro:masculino" },
  { keyword: "porteiros", type: "porteiro", combo: "porteiro:masculino" },
  { keyword: "porteira", type: "porteiro", combo: "porteiro:feminino" },
  { keyword: "porteiras", type: "porteiro", combo: "porteiro:feminino" },
  // seguranca (gender-neutral label)
  { keyword: "seguranca", type: "seguranca", combo: "seguranca:masculino" },
  { keyword: "segurancas", type: "seguranca", combo: "seguranca:feminino" },
  // monitor
  { keyword: "monitor", type: "monitor", combo: "monitor:masculino" },
  { keyword: "monitores", type: "monitor", combo: "monitor:masculino" },
  { keyword: "monitora", type: "monitor", combo: "monitor:feminino" },
  { keyword: "monitoras", type: "monitor", combo: "monitor:feminino" },
  // recepcionista (gender-neutral label, differentiated by grammar number)
  { keyword: "recepcionista", type: "recepcionista", combo: "recepcionista" },
  { keyword: "recepcionistas", type: "recepcionista", combo: "recepcionista" },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function inferServiceTypeFromDescription(
  description: string | null | undefined,
): BudgetServiceType | null {
  const normalized = normalize(description || "");

  if (!normalized.trim()) {
    return null;
  }

  for (const entry of BUDGET_SERVICE_KEYWORDS) {
    if (normalized.includes(entry.keyword)) {
      return entry.type;
    }
  }

  return null;
}

/**
 * Returns a unique combo key for (serviceType × gender) inferred from the
 * item description. Used for duplicate-combo detection instead of
 * duplicate-type detection, so garçom + garçonete can coexist.
 */
export function inferServiceComboFromDescription(
  description: string | null | undefined,
): string | null {
  const normalized = normalize(description || "");

  if (!normalized.trim()) {
    return null;
  }

  for (const entry of BUDGET_SERVICE_KEYWORDS) {
    if (normalized.includes(entry.keyword)) {
      return entry.combo;
    }
  }

  return null;
}
