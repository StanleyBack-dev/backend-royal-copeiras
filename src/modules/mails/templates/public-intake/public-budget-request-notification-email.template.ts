import { renderStandardEmailLayout } from "../layout/standard-email-layout.template";
import { EMAIL_BRAND } from "../layout/email-brand";

interface PublicBudgetRequestItem {
  description: string;
  serviceGender?: string | null;
  quantity: number;
  eventDateIndex: number;
}

interface PublicBudgetRequestNotificationInput {
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  leadDocument?: string;
  budgetNumber: string;
  budgetUrl: string;
  eventDates: string[];
  eventArrivalTimes: string[];
  eventDepartureTimes: string[];
  eventLocation: string[];
  guestCount: number[];
  durationHours: number[];
  items: PublicBudgetRequestItem[];
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatPerDay<T>(
  dates: string[],
  values: T[],
  format: (value: T) => string,
): string {
  if (!values.length) {
    return "Não informado";
  }

  return values
    .map((value, index) => {
      const date = dates[index];
      const formatted = format(value);
      return date ? `${formatDate(date)}: ${formatted}` : formatted;
    })
    .join(" | ");
}

function buildDetailRow(label: string, value: string): string {
  return `<p style="margin:0 0 6px 0;font-size:14px;color:${EMAIL_BRAND.text};"><strong style="color:${EMAIL_BRAND.accentDark};">${label}:</strong> ${value}</p>`;
}

function buildItemsTable(
  items: PublicBudgetRequestItem[],
  eventDates: string[],
): string {
  if (!items.length) {
    return "";
  }

  const dayLabel = (index: number) =>
    eventDates[index] ? formatDate(eventDates[index]) : `Dia ${index + 1}`;

  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:14px;color:${EMAIL_BRAND.text};">${dayLabel(item.eventDateIndex)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:14px;color:${EMAIL_BRAND.text};">${item.description}</td>
        <td style="padding:8px 10px;border-bottom:1px solid ${EMAIL_BRAND.border};font-size:14px;color:${EMAIL_BRAND.text};text-align:center;">${item.quantity}</td>
      </tr>
    `,
    )
    .join("");

  return `
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid ${EMAIL_BRAND.border};border-radius:8px;overflow:hidden;margin:16px 0;">
      <thead>
        <tr style="background:${EMAIL_BRAND.cardBackground};">
          <th style="padding:8px 10px;text-align:left;font-size:12px;font-weight:700;color:${EMAIL_BRAND.textMuted};text-transform:uppercase;letter-spacing:.5px;">Dia</th>
          <th style="padding:8px 10px;text-align:left;font-size:12px;font-weight:700;color:${EMAIL_BRAND.textMuted};text-transform:uppercase;letter-spacing:.5px;">Serviço</th>
          <th style="padding:8px 10px;text-align:center;font-size:12px;font-weight:700;color:${EMAIL_BRAND.textMuted};text-transform:uppercase;letter-spacing:.5px;">Qtd</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

export function buildPublicBudgetRequestNotificationEmail(
  input: PublicBudgetRequestNotificationInput,
): {
  subject: string;
  html: string;
  text: string;
} {
  const eventDatesLabel = input.eventDates.length
    ? input.eventDates.map(formatDate).join(", ")
    : "Não informado";
  const arrivalLabel = formatPerDay(
    input.eventDates,
    input.eventArrivalTimes,
    (value) => value,
  );
  const departureLabel = formatPerDay(
    input.eventDates,
    input.eventDepartureTimes,
    (value) => value,
  );
  const locationLabel = formatPerDay(
    input.eventDates,
    input.eventLocation,
    (value) => value,
  );
  const guestCountLabel = formatPerDay(
    input.eventDates,
    input.guestCount,
    (value) => String(value),
  );
  const durationLabel = formatPerDay(
    input.eventDates,
    input.durationHours,
    (value) => `${value}h`,
  );

  const detailsHtml = [
    buildDetailRow("Lead", input.leadName),
    input.leadEmail ? buildDetailRow("E-mail", input.leadEmail) : "",
    input.leadPhone ? buildDetailRow("Telefone", input.leadPhone) : "",
    input.leadDocument ? buildDetailRow("Documento", input.leadDocument) : "",
    buildDetailRow("Número do orçamento", input.budgetNumber),
    buildDetailRow("Datas do evento", eventDatesLabel),
    buildDetailRow("Início do evento", arrivalLabel),
    buildDetailRow("Fim do evento", departureLabel),
    buildDetailRow("Local do evento", locationLabel),
    buildDetailRow("Convidados", guestCountLabel),
    buildDetailRow("Duração", durationLabel),
  ]
    .filter(Boolean)
    .join("");

  const contentHtml = `
    <p style="margin:0 0 14px 0;color:${EMAIL_BRAND.textMuted};">Um cliente preencheu o formulário público de orçamentos. Confira os detalhes abaixo e complete a proposta comercial no sistema.</p>
    <div style="background:${EMAIL_BRAND.cardBackground};border:1px solid ${EMAIL_BRAND.border};border-radius:10px;padding:14px 16px;margin:0 0 16px 0;">
      ${detailsHtml}
    </div>
    ${buildItemsTable(input.items, input.eventDates)}
  `;

  const html = renderStandardEmailLayout({
    title: `Novo orçamento solicitado - ${input.budgetNumber}`,
    preheader: `Um novo orçamento foi solicitado pelo formulário público: ${input.budgetNumber}`,
    heading: "Novo orçamento solicitado",
    greeting: "Olá!",
    contentHtml,
    ctaLabel: "Abrir orçamento",
    ctaUrl: input.budgetUrl,
    footerNote:
      "Você recebeu este e-mail porque um cliente enviou uma solicitação pelo link público de orçamentos.",
  });

  const textLines: string[] = [
    "Um cliente preencheu o formulário público de orçamentos.",
    "",
    `Lead: ${input.leadName}`,
  ];

  if (input.leadEmail) textLines.push(`E-mail: ${input.leadEmail}`);
  if (input.leadPhone) textLines.push(`Telefone: ${input.leadPhone}`);
  if (input.leadDocument) textLines.push(`Documento: ${input.leadDocument}`);

  textLines.push(
    `Número do orçamento: ${input.budgetNumber}`,
    `Datas do evento: ${eventDatesLabel}`,
    `Início do evento: ${arrivalLabel}`,
    `Fim do evento: ${departureLabel}`,
    `Local do evento: ${locationLabel}`,
    `Convidados: ${guestCountLabel}`,
    `Duração: ${durationLabel}`,
    "",
    "Serviços:",
  );

  input.items.forEach((item) => {
    const dayLabel = input.eventDates[item.eventDateIndex]
      ? formatDate(input.eventDates[item.eventDateIndex])
      : `Dia ${item.eventDateIndex + 1}`;
    textLines.push(
      `  - [${dayLabel}] ${item.description} | Qtd: ${item.quantity}`,
    );
  });

  textLines.push("", `Abrir orçamento: ${input.budgetUrl}`);

  return {
    subject: `Novo orçamento solicitado - ${input.budgetNumber}`,
    html,
    text: textLines.join("\n"),
  };
}
