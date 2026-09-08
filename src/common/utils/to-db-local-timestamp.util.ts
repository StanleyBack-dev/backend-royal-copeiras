const DEFAULT_DB_TIMEZONE = "America/Sao_Paulo";

function formatToParts(date: Date, timeZone: string): Record<string, string> {
  return new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((accumulator, part) => {
      if (part.type !== "literal") {
        accumulator[part.type] = part.value;
      }
      return accumulator;
    }, {});
}

/**
 * Renders the wall-clock time of `date` in `timeZone` as a naive
 * "YYYY-MM-DDTHH:mm:ss.SSS" string — no offset, no "Z" — matching exactly
 * what format-local-datetime.util produces when reading a `timestamp`
 * (no time zone) column back out.
 *
 * Use this — never a Date object — as the value written into a naive
 * `timestamp` column. A JS Date bound as a query parameter is serialized
 * by the pg driver using the Node *process's own* OS timezone, which is
 * UTC on Vercel but is very often the developer's own zone locally
 * (e.g. America/Sao_Paulo) — the same code would silently store a
 * different wall-clock value depending on who/where it runs. A plain
 * string sidesteps that: pg forwards strings for timestamp columns
 * unchanged, so Postgres receives exactly these digits, independent of
 * the environment.
 */
export function toDbLocalTimestampString(
  date: Date,
  timeZone: string = DEFAULT_DB_TIMEZONE,
): string {
  const parts = formatToParts(date, timeZone);
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.${milliseconds}`;
}

/**
 * "Now", constructed the same way the pg driver reconstructs a Date from
 * a naive `timestamp` column: local Date-string parsing, which ECMA-262
 * defines as using the process's own timezone when no offset is present.
 * Comparing this against a value TypeORM read back from a naive column
 * yields the correct chronological ordering *regardless of what timezone
 * the Node process happens to run under* — both sides go through the
 * identical local-string round-trip, so any offset the process's
 * timezone introduces cancels out on both sides.
 */
export function dbLocalNow(timeZone: string = DEFAULT_DB_TIMEZONE): Date {
  return new Date(toDbLocalTimestampString(new Date(), timeZone));
}
