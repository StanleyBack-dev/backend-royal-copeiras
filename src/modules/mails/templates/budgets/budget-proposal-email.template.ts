import { renderStandardEmailLayout } from "../layout/standard-email-layout.template";

interface BudgetProposalItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

interface BudgetProposalTemplateInput {
  leadName: string;
  budgetNumber: string;
  issueDate: string;
  validUntil: string;
  eventLocation?: string;
  eventDates?: string[];
  guestCount?: number;
  durationHours?: number;
  paymentMethod?: string;
  advancePercentage?: number;
  subtotal: number;
  totalAmount: number;
  items: BudgetProposalItem[];
}

const FIXED_BUDGET_NOTE =
  "Para sua comodidade, informamos que o valor já inclui o deslocamento da copeira.";

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function extractServiceTypes(items: BudgetProposalItem[]): string[] {
  const labels = [
    { key: "garcom", label: "Garçom" },
    { key: "copeira", label: "Copeira" },
    { key: "porteiro", label: "Porteiro" },
    { key: "seguranca", label: "Segurança" },
  ] as const;

  const found = new Set<string>();

  for (const item of items) {
    const description = normalizeText(item.description);
    for (const entry of labels) {
      if (description.includes(entry.key)) {
        found.add(entry.label);
      }
    }
  }

  return Array.from(found);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function buildItemsTable(items: BudgetProposalItem[]): string {
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 10px;border-bottom:1px solid #eadfd7;font-size:14px;color:#3d2a22;">${item.description}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eadfd7;font-size:14px;color:#3d2a22;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eadfd7;font-size:14px;color:#3d2a22;text-align:right;">${formatCurrency(item.unitPrice)}</td>
        <td style="padding:8px 10px;border-bottom:1px solid #eadfd7;font-size:14px;color:#3d2a22;text-align:right;"><strong>${formatCurrency(item.totalPrice)}</strong></td>
      </tr>
      ${item.notes ? `<tr><td colspan="4" style="padding:2px 10px 8px 10px;font-size:12px;color:#7b655b;border-bottom:1px solid #eadfd7;">Obs: ${item.notes}</td></tr>` : ""}
    `,
    )
    .join("");

  return `
    <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid #eadfd7;border-radius:8px;overflow:hidden;margin:16px 0;">
      <thead>
        <tr style="background:#f9f6f4;">
          <th style="padding:8px 10px;text-align:left;font-size:12px;font-weight:700;color:#7a4430;text-transform:uppercase;letter-spacing:.5px;">Descrição</th>
          <th style="padding:8px 10px;text-align:center;font-size:12px;font-weight:700;color:#7a4430;text-transform:uppercase;letter-spacing:.5px;">Qtd</th>
          <th style="padding:8px 10px;text-align:right;font-size:12px;font-weight:700;color:#7a4430;text-transform:uppercase;letter-spacing:.5px;">Valor Unit.</th>
          <th style="padding:8px 10px;text-align:right;font-size:12px;font-weight:700;color:#7a4430;text-transform:uppercase;letter-spacing:.5px;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildDetailRow(label: string, value: string): string {
  return `<p style="margin:0 0 6px 0;font-size:14px;color:#3d2a22;"><strong>${label}:</strong> ${value}</p>`;
}

function buildPlainText(input: BudgetProposalTemplateInput): string {
  const serviceTypes = extractServiceTypes(input.items);
  const serviceTypesText = serviceTypes.length
    ? `Tipos de serviço previstos: ${serviceTypes.join(", ")}.`
    : "Tipos de serviço previstos conforme proposta enviada.";

  const lines: string[] = [
    `Olá, ${input.leadName}.`,
    "",
    `Segue a proposta comercial referente ao orçamento ${input.budgetNumber}.`,
    "",
    `Data de emissão: ${formatDate(input.issueDate)}`,
    `Validade: ${formatDate(input.validUntil)}`,
  ];

  if (input.eventLocation) {
    lines.push(`Local do evento: ${input.eventLocation}`);
  }
  if (input.eventDates?.length) {
    lines.push(
      `Datas do evento: ${input.eventDates.map(formatDate).join(", ")}`,
    );
  }
  if (input.guestCount) {
    lines.push(`Número de convidados: ${input.guestCount}`);
  }
  if (input.durationHours) {
    lines.push(`Duração: ${input.durationHours}h`);
  }
  if (input.paymentMethod) {
    lines.push(`Forma de pagamento: ${input.paymentMethod}`);
  }
  if (input.advancePercentage !== undefined) {
    lines.push(`Entrada: ${input.advancePercentage}%`);
  }

  lines.push("", "Itens:");
  input.items.forEach((item) => {
    lines.push(
      `  - ${item.description} | Qtd: ${item.quantity} | Unit.: ${formatCurrency(item.unitPrice)} | Total: ${formatCurrency(item.totalPrice)}`,
    );
    if (item.notes) {
      lines.push(`    Obs: ${item.notes}`);
    }
  });

  lines.push("", `Subtotal: ${formatCurrency(input.subtotal)}`);
  lines.push(`Total: ${formatCurrency(input.totalAmount)}`);

  lines.push("", FIXED_BUDGET_NOTE);
  lines.push(serviceTypesText);

  lines.push(
    "",
    "Em caso de dúvidas, entre em contato conosco.",
    "Atenciosamente, Royal Copeiras",
  );

  return lines.join("\n");
}

export function buildBudgetProposalEmail(input: BudgetProposalTemplateInput): {
  subject: string;
  html: string;
  text: string;
} {
  const firstName = input.leadName.split(" ")[0] || input.leadName;

  const detailsHtml = [
    buildDetailRow("Número do orçamento", input.budgetNumber),
    buildDetailRow("Data de emissão", formatDate(input.issueDate)),
    buildDetailRow("Válido até", formatDate(input.validUntil)),
    input.eventLocation
      ? buildDetailRow("Local do evento", input.eventLocation)
      : "",
    input.eventDates?.length
      ? buildDetailRow(
          "Datas do evento",
          input.eventDates.map(formatDate).join(", "),
        )
      : "",
    input.guestCount
      ? buildDetailRow("Convidados", String(input.guestCount))
      : "",
    input.durationHours
      ? buildDetailRow("Duração", `${input.durationHours}h`)
      : "",
    input.paymentMethod
      ? buildDetailRow("Forma de pagamento", input.paymentMethod)
      : "",
    input.advancePercentage !== undefined
      ? buildDetailRow("Entrada", `${input.advancePercentage}%`)
      : "",
  ]
    .filter(Boolean)
    .join("");

  const totalsHtml = `
    <table width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">
      <tr>
        <td style="font-size:14px;color:#3d2a22;">Subtotal</td>
        <td style="font-size:14px;color:#3d2a22;text-align:right;">${formatCurrency(input.subtotal)}</td>
      </tr>
      <tr>
        <td style="font-size:16px;font-weight:700;color:#2c1810;padding-top:6px;">Total</td>
        <td style="font-size:16px;font-weight:700;color:#2c1810;text-align:right;padding-top:6px;">${formatCurrency(input.totalAmount)}</td>
      </tr>
    </table>
  `;
  const serviceTypes = extractServiceTypes(input.items);
  const serviceTypesText = serviceTypes.length
    ? `Tipos de serviço previstos: ${serviceTypes.join(", ")}.`
    : "Tipos de serviço previstos conforme proposta enviada.";

  const notesHtml = `<div style="margin-top:14px;padding:12px 14px;background:#faf6f2;border:1px solid #eadfd7;border-radius:8px;font-size:13px;color:#3d2a22;"><strong>Informações importantes:</strong><br>${FIXED_BUDGET_NOTE}<br>${serviceTypesText}</div>`;

  const contentHtml = `
    <p style="margin:0 0 14px 0;">Segue a proposta comercial preparada especialmente para você.</p>
    <div style="background:#faf6f2;border:1px solid #eadfd7;border-radius:10px;padding:14px 16px;margin:0 0 16px 0;">
      ${detailsHtml}
    </div>
    ${buildItemsTable(input.items)}
    ${totalsHtml}
    ${notesHtml}
    <p style="margin:20px 0 0 0;font-size:14px;color:#3d2a22;">Em caso de dúvidas, entre em contato conosco. Teremos prazer em atendê-lo(a).</p>
  `;

  const html = renderStandardEmailLayout({
    title: `Proposta Comercial - ${input.budgetNumber}`,
    preheader: `Orçamento ${input.budgetNumber} - Royal Copeiras`,
    heading: "Proposta Comercial",
    greeting: `Olá, ${firstName}!`,
    contentHtml,
    footerNote:
      "Você recebeu esta proposta porque seu contato está cadastrado em nosso sistema. Para mais informações, responda este e-mail.",
  });

  return {
    subject: `Proposta Comercial ${input.budgetNumber} - Royal Copeiras`,
    html,
    text: buildPlainText(input),
  };
}
