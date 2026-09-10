import { Repository } from "typeorm";
import { LeadsEntity } from "../../entities/leads.entity";

/**
 * Accent map kept identical on both sides of the comparison (DB column and the
 * incoming value are folded by the same SQL `translate` call), so normalization
 * never drifts between JS and Postgres.
 */
const ACCENT_FROM = "áàâãäçéèêëíìîïñóòôõöúùûüýÁÀÂÃÄÇÉÈÊËÍÌÎÏÑÓÒÔÕÖÚÙÛÜÝ";
const ACCENT_TO = "aaaaaceeeeiiiinooooouuuuyAAAAACEEEEIIIINOOOOOUUUUY";

/** Digits-only representation of a CPF/CNPJ (or empty string when absent). */
export function normalizeLeadDocument(value?: string | null): string {
  return (value ?? "").replace(/\D/g, "");
}

interface LeadDuplicateQuery {
  name: string;
  document?: string | null;
  excludeId?: string;
}

/**
 * Finds an existing lead that shares the same name (accent/case/space
 * insensitive) AND the same document. Used to stop the same client being
 * registered twice. Returns `null` when the name is blank.
 */
export async function findDuplicateLead(
  leadsRepo: Repository<LeadsEntity>,
  { name, document, excludeId }: LeadDuplicateQuery,
): Promise<LeadsEntity | null> {
  const trimmedName = (name ?? "").trim();

  if (!trimmedName) {
    return null;
  }

  const normalizedDocument = normalizeLeadDocument(document);

  const query = leadsRepo
    .createQueryBuilder("lead")
    .where(
      "lower(regexp_replace(translate(lead.name, :accentFrom, :accentTo), '\\s+', ' ', 'g')) = " +
        "lower(regexp_replace(translate(:name, :accentFrom, :accentTo), '\\s+', ' ', 'g'))",
      { accentFrom: ACCENT_FROM, accentTo: ACCENT_TO, name: trimmedName },
    )
    .andWhere(
      "coalesce(regexp_replace(lead.document, '\\D', '', 'g'), '') = :normalizedDocument",
      { normalizedDocument },
    );

  if (excludeId) {
    query.andWhere("lead.idLeads != :excludeId", { excludeId });
  }

  return query.getOne();
}
