import { formatContractDateOnly } from "./contract-date.util";

interface BuildContractPdfFileNameParams {
  contractNumber?: string;
  issueDate?: Date | string;
}

function sanitizeSegment(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function resolveDateSegment(issueDate?: Date | string): string {
  if (!issueDate) {
    return "sem-data";
  }

  const normalized = formatContractDateOnly(issueDate);
  if (!normalized) {
    return "sem-data";
  }

  const [year, month, day] = normalized.split("-");
  if (!year || !month || !day) {
    return "sem-data";
  }

  return `${day}-${month}-${year}`;
}

export function buildContractPdfFileName(
  params: BuildContractPdfFileNameParams,
): string {
  const numberSegment = params.contractNumber
    ? sanitizeSegment(params.contractNumber)
    : "contrato";
  const dateSegment = resolveDateSegment(params.issueDate);

  return `ctr-${numberSegment}-${dateSegment}.pdf`;
}
