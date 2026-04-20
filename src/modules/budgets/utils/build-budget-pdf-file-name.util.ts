function normalizeLeadName(value?: string): string {
  const normalized = (value || "lead")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

  return normalized || "lead";
}

function formatIssueDate(value: Date | string): string {
  if (typeof value === "string") {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}-${month}-${year}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "00-00-0000";
  }

  const isoDate = date.toISOString().slice(0, 10);
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
}

export function buildBudgetPdfFileName(input: {
  leadName?: string;
  issueDate: Date | string;
}): string {
  const leadName = normalizeLeadName(input.leadName);
  const issueDate = formatIssueDate(input.issueDate);

  return `orc-${leadName}-${issueDate}.pdf`;
}
