const SAO_PAULO_TIMEZONE = "America/Sao_Paulo";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("en-CA", {
  timeZone: SAO_PAULO_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export function formatLocalDateTime(value?: Date): string | undefined {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return undefined;
  }

  const parts = DATE_TIME_FORMATTER.formatToParts(value);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const milliseconds = String(value.getMilliseconds()).padStart(3, "0");

  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}.${milliseconds}`;
}
