import { Injectable } from "@nestjs/common";
import { BudgetProposalPdfPayload } from "../../../pdf-generator/templates/budgets/interfaces/budget-proposal-pdf-payload.interface";
import { BudgetPdfSnapshot } from "../../interfaces/budget-pdf-snapshot.interface";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatLongDateBR,
} from "../../../../utils/pdf";

const INTRODUCTION_PARAGRAPHS = [
  "A Royal Copeiras se dedica a oferecer um serviço exclusivo de copeiragem para eventos sofisticados, contando com profissionais altamente qualificados para assegurar a organização e a impecável higienização dos ambientes. Nossa equipe é treinada para atender com discrição e eficiência.",
  "Oferecemos profissionais uniformizados que zelam pelo bem-estar dos convidados, mantendo a organização com kits funcionais e materiais de excelência.",
];

const PROPOSAL_VALIDITY_DAYS = 15;
const ITEMS_SECTION_TITLE = "Serviços e Taxas Propostos";
const DISPLACEMENT_FEE_DESCRIPTION =
  "Taxa de deslocamento da equipe para atendimento no local do evento.";

function sanitizeBudgetItemDescription(description: string): string {
  const trimmed = description.trim();
  const canonicalMatch = trimmed.match(
    /^(Prestação de serviço de[\s\S]*?execução do serviço contratado\.)/i,
  );

  if (canonicalMatch) {
    return canonicalMatch[1].trim();
  }

  const fallbackMatch = trimmed.match(
    /^(Prestacao de servico de[\s\S]*?execucao do servico contratado\.)/i,
  );

  if (fallbackMatch) {
    return fallbackMatch[1].trim();
  }

  return trimmed;
}

@Injectable()
export class BuildBudgetProposalPdfPayloadService {
  build(
    snapshot: BudgetPdfSnapshot,
    snapshotHash: string,
  ): BudgetProposalPdfPayload {
    const today = new Date();
    const displacementFee = snapshot.budget.displacementFee ?? 0;
    const eventDates = snapshot.budget.eventDates.length
      ? snapshot.budget.eventDates
          .map((value) => formatDateBR(value))
          .join(" | ")
      : "A definir";

    const notes = [snapshot.budget.notes]
      .filter((value): value is string => Boolean(value?.trim()))
      .map((value) => value.trim());

    return {
      companyName: "Royal Copeiras",
      companySubtitle:
        "Serviços de copeiragem e apoio para eventos sofisticados",
      documentTitle: "Orçamento",
      documentSubtitle: "Proposta comercial",
      logoPlaceholderLabel: "Logo da empresa",
      itemsSectionTitle: ITEMS_SECTION_TITLE,
      introductionParagraphs: INTRODUCTION_PARAGRAPHS,
      metadata: [
        { label: "Número", value: snapshot.budget.budgetNumber },
        {
          label: "Emitido em",
          value: formatDateBR(snapshot.budget.issueDate),
        },
        {
          label: "Válido até",
          value: formatDateBR(snapshot.budget.validUntil),
        },
      ],
      eventDetails: [
        { label: "Datas do evento", value: eventDates },
        {
          label: "Local",
          value: snapshot.budget.eventLocation || "A definir",
        },
        {
          label: "Convidados",
          value: snapshot.budget.guestCount
            ? String(snapshot.budget.guestCount)
            : "Nao informado",
        },
        {
          label: "Duração",
          value: snapshot.budget.durationHours
            ? `${snapshot.budget.durationHours} horas`
            : "Não informada",
        },
        {
          label: "Entrada",
          value:
            snapshot.budget.advancePercentage !== undefined
              ? `${snapshot.budget.advancePercentage}%`
              : "Não informada",
        },
        {
          label: "Taxa de deslocamento",
          value: formatCurrencyBRL(displacementFee),
        },
      ],
      items: [
        ...[...snapshot.items]
          .sort((left, right) => left.sortOrder - right.sortOrder)
          .map((item) => ({
            description: sanitizeBudgetItemDescription(item.description),
            quantity: String(item.quantity),
            unitPrice: formatCurrencyBRL(item.unitPrice),
            totalPrice: formatCurrencyBRL(item.totalPrice),
            notes: item.notes,
          })),
        {
          description: DISPLACEMENT_FEE_DESCRIPTION,
          quantity: "1",
          unitPrice: formatCurrencyBRL(displacementFee),
          totalPrice: formatCurrencyBRL(displacementFee),
        },
      ],
      notes,
      totals: {
        subtotal: formatCurrencyBRL(snapshot.budget.subtotal),
        total: formatCurrencyBRL(snapshot.budget.totalAmount),
      },
      footer: {
        cityAndIssueDate: `Goiânia, ${formatLongDateBR(today)}`,
        validity: `Validade da proposta: ${PROPOSAL_VALIDITY_DAYS} dias`,
        reservationPolicy:
          "A confirmação da reserva depende da disponibilidade na data e do pagamento conforme condições.",
        convenienceMessage:
          "Os valores apresentados já incluem todas as taxas e encargos acordados.",
        paymentMethods: "Formas de Pagamento: Pix ou transferência bancária.",
      },
      referenceCode: snapshotHash,
    };
  }
}
