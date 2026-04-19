export const BUDGET_ALLOWED_SERVICE_TYPES = [
  "garcom",
  "copeira",
  "porteiro",
  "seguranca",
] as const;

export type BudgetServiceType = (typeof BUDGET_ALLOWED_SERVICE_TYPES)[number];

const BUDGET_SERVICE_TYPE_KEYWORDS: Record<
  BudgetServiceType,
  readonly string[]
> = {
  garcom: ["garcom", "garcons"],
  copeira: ["copeira", "copeiras"],
  porteiro: ["porteiro", "porteiros"],
  seguranca: ["seguranca", "segurancas"],
};

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

  for (const serviceType of BUDGET_ALLOWED_SERVICE_TYPES) {
    const keywords = BUDGET_SERVICE_TYPE_KEYWORDS[serviceType];
    if (keywords.some((keyword) => normalized.includes(keyword))) {
      return serviceType;
    }
  }

  return null;
}
