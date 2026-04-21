function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

interface BuildWhatsAppContractSignatureLinkInput {
  phone?: string;
  leadName: string;
  contractNumber: string;
  signatureUrl: string;
}

export function buildWhatsAppContractSignatureLink(
  input: BuildWhatsAppContractSignatureLinkInput,
): string | undefined {
  if (!input.phone) {
    return undefined;
  }

  const cleanPhone = normalizePhone(input.phone);
  if (!cleanPhone) {
    return undefined;
  }

  const message =
    `Ola, ${input.leadName}. ` +
    `Segue o link para assinatura do contrato ${input.contractNumber}: ` +
    `${input.signatureUrl}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
