const DURATION_PATTERN = /^(\d+)(ms|s|m|h|d)$/i;

const DURATION_MULTIPLIERS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDurationToMs(value: string): number {
  if (/^\d+$/.test(value)) {
    return Number(value) * 1000;
  }

  const match = DURATION_PATTERN.exec(value.trim());
  if (!match) {
    throw new Error(`Formato de duração inválido: ${value}`);
  }

  const [, amount, unit] = match;
  return Number(amount) * DURATION_MULTIPLIERS[unit.toLowerCase()];
}
