/**
 * CONTRATADA identity frozen into a contract.
 *
 * Populated on contract creation from the company profile (company-profile
 * module) and optionally overridden per contract. Once written to
 * `contractSnapshot.contractor` it stays immutable for that contract, which
 * protects the legal history.
 */
export interface ContractPartySnapshot {
  legalName?: string;
  tradeName?: string;
  document?: string;
  stateRegistration?: string;
  municipalRegistration?: string;
  email?: string;
  phone?: string;
  address?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;
  representativeName?: string;
  representativeRole?: string;
  representativeDocument?: string;
  pixKey?: string;
  pixKeyType?: string;
  issueCity?: string;
}

export const CONTRACT_PARTY_FIELDS: Array<keyof ContractPartySnapshot> = [
  "legalName",
  "tradeName",
  "document",
  "stateRegistration",
  "municipalRegistration",
  "email",
  "phone",
  "address",
  "addressCity",
  "addressState",
  "addressZipCode",
  "representativeName",
  "representativeRole",
  "representativeDocument",
  "pixKey",
  "pixKeyType",
  "issueCity",
];

/**
 * Strips empty/whitespace-only keys from a partial contractor override.
 */
export function sanitizeContractParty(
  input?: Partial<Record<keyof ContractPartySnapshot, unknown>> | null,
): ContractPartySnapshot {
  if (!input) {
    return {};
  }

  const result: ContractPartySnapshot = {};
  for (const field of CONTRACT_PARTY_FIELDS) {
    const value = input[field];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.length > 0) {
        result[field] = trimmed;
      }
    }
  }

  return result;
}

/**
 * Merges a base contractor identity (company profile) with an optional
 * per-contract override, keeping only non-empty string values.
 */
export function resolveContractParty(
  base?: Partial<Record<keyof ContractPartySnapshot, unknown>> | null,
  override?: Partial<Record<keyof ContractPartySnapshot, unknown>> | null,
): ContractPartySnapshot {
  return {
    ...sanitizeContractParty(base),
    ...sanitizeContractParty(override),
  };
}

/**
 * Builds the CONTRATADA identification lines for the "Partes" block of the PDF.
 *
 * Intentionally short: "Razão Social" + "Nome fantasia", CNPJ / Inscrição
 * Estadual and contact only. Address and legal representative are not printed
 * in the contract body.
 */
export function buildContractPartyLines(
  party: ContractPartySnapshot,
): string[] {
  const lines: string[] = [];
  const legalName = party.legalName?.trim();
  const tradeName = party.tradeName?.trim();

  if (legalName) {
    lines.push(`Razão Social: ${legalName}`);
  }

  if (tradeName && tradeName.toLowerCase() !== legalName?.toLowerCase()) {
    lines.push(`Nome fantasia: ${tradeName}`);
  }

  if (party.document?.trim()) {
    lines.push(`CNPJ: ${party.document.trim()}`);
  }

  if (party.stateRegistration?.trim()) {
    lines.push(`Inscrição Estadual: ${party.stateRegistration.trim()}`);
  }

  if (party.email?.trim()) {
    lines.push(`E-mail: ${party.email.trim()}`);
  }

  if (party.phone?.trim()) {
    lines.push(`Telefone: ${party.phone.trim()}`);
  }

  return lines;
}
