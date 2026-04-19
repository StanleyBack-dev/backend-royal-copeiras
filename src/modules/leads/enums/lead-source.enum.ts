import { registerEnumType } from "@nestjs/graphql";

export enum LeadSource {
  INSTAGRAM = "instagram",
  REFERRAL = "referral",
  WEBSITE = "website",
  WHATSAPP = "whatsapp",
  EVENT = "event",
  OTHER = "other",
}

const LEAD_SOURCE_VALUES = new Set<string>(Object.values(LeadSource));

export function normalizeLeadSource(
  value?: string | null,
): LeadSource | undefined {
  if (!value) {
    return undefined;
  }

  return LEAD_SOURCE_VALUES.has(value)
    ? (value as LeadSource)
    : LeadSource.OTHER;
}

registerEnumType(LeadSource, {
  name: "LeadSource",
});
