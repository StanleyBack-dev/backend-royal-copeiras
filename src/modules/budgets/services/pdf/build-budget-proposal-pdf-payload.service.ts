import { Injectable } from "@nestjs/common";
import { BudgetProposalPdfPayload } from "../../../pdf-generator/templates/budgets/interfaces/budget-proposal-pdf-payload.interface";
import { BudgetPdfSnapshot } from "../../interfaces/budget-pdf-snapshot.interface";
import {
  formatCurrencyBRL,
  formatDateBR,
  formatLongDateBR,
} from "../../../../utils/pdf";

const INTRODUCTION_PARAGRAPHS = [
  "A Royal Copeiras se dedica a oferecer um serviço exclusivo de copeiragem para eventos sofisticados, contando com profissionais altamente qualificados para assegurar a organizacao e a impecavel higienizacao dos ambientes. Nossa equipe e treinada para atender com discricao e eficiencia.",
  "Oferecemos profissionais uniformizados que zelam pelo bem-estar dos convidados, mantendo a organizacao com kits funcionais e materiais de excelencia.",
];

const PROPOSAL_VALIDITY_DAYS = 15;

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
        "Servicos de copeiragem e apoio para eventos sofisticados",
      documentTitle: "Orcamento",
      documentSubtitle: "Proposta comercial",
      logoPlaceholderLabel: "Logo da empresa",
      introductionParagraphs: INTRODUCTION_PARAGRAPHS,
      metadata: [
        { label: "Numero", value: snapshot.budget.budgetNumber },
        {
          label: "Emitido em",
          value: formatDateBR(snapshot.budget.issueDate),
        },
        {
          label: "Valido ate",
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
          label: "Duracao",
          value: snapshot.budget.durationHours
            ? `${snapshot.budget.durationHours} horas`
            : "Nao informada",
        },
        {
          label: "Entrada",
          value:
            snapshot.budget.advancePercentage !== undefined
              ? `${snapshot.budget.advancePercentage}%`
              : "Nao informada",
        },
      ],
      items: [...snapshot.items]
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((item) => ({
          description: sanitizeBudgetItemDescription(item.description),
          quantity: String(item.quantity),
          unitPrice: formatCurrencyBRL(item.unitPrice),
          totalPrice: formatCurrencyBRL(item.totalPrice),
          notes: item.notes,
        })),
      notes,
      totals: {
        subtotal: formatCurrencyBRL(snapshot.budget.subtotal),
        total: formatCurrencyBRL(snapshot.budget.totalAmount),
      },
      footer: {
        cityAndIssueDate: `Goiania, ${formatLongDateBR(today)}`,
        validity: `Validade da proposta: ${PROPOSAL_VALIDITY_DAYS} dias`,
        reservationPolicy:
          "A confirmacao da reserva depende da disponibilidade na data e do pagamento conforme condicoes.",
        convenienceMessage:
          "Para sua comodidade, informamos que o valor ja inclui o deslocamento do funcionario.",
        paymentMethods: "Formas de Pagamento: Pix ou transferencia bancaria.",
      },
      referenceCode: snapshotHash,
    };
  }
}
