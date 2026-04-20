function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function parseContractDateOnly(value?: string): Date {
  if (!value) {
    const now = new Date();
    return new Date(
      Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0),
    );
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }

    return parseContractDateOnly();
  }

  const [, year, month, day] = match;
  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day), 12, 0, 0),
  );
}

export function formatContractDateOnly(value: Date | string): string {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }

  const parsed = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return `${parsed.getUTCFullYear()}-${pad(parsed.getUTCMonth() + 1)}-${pad(parsed.getUTCDate())}`;
}
