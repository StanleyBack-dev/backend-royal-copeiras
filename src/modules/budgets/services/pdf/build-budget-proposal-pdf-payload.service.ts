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
const DISCOUNT_DESCRIPTION =
  "Desconto aplicado sobre o valor total da proposta.";

function resolveDiscountSummary(budget: BudgetPdfSnapshot["budget"]) {
  if (budget.discountType === "percentage") {
    const percentage = Number(budget.discountPercentage ?? 0);
    if (!Number.isFinite(percentage) || percentage <= 0) {
      return { label: undefined, amount: 0 };
    }

    const baseTotal =
      Number(budget.subtotal ?? 0) + Number(budget.displacementFee ?? 0);
    const amount = Number((baseTotal * (percentage / 100)).toFixed(2));
    return {
      label: `Desconto (${percentage}%)`,
      amount,
    };
  }

  if (budget.discountType === "amount") {
    const amount = Number(budget.discountAmount ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return { label: undefined, amount: 0 };
    }

    return {
      label: "Desconto (Valor Fixo)",
      amount: Number(amount.toFixed(2)),
    };
  }

  return { label: undefined, amount: 0 };
}

function parseTimeToMinutes(time?: string): number | undefined {
  if (!time || !/^\d{2}:\d{2}$/.test(time)) {
    return undefined;
  }

  const [hours, minutes] = time.split(":").map(Number);
  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return undefined;
  }

  return hours * 60 + minutes;
}

function addOneDayIsoDate(date: string): string {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  parsed.setDate(parsed.getDate() + 1);
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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
    const hasDisplacementFee = displacementFee > 0;
    const discount = resolveDiscountSummary(snapshot.budget);
    const eventDates = snapshot.budget.eventDates.length
      ? snapshot.budget.eventDates
          .map((value) => formatDateBR(value))
          .join(" | ")
      : "A definir";
    const eventArrivalTimes = this.buildEventTimesLabel(
      snapshot.budget.eventDates,
      snapshot.budget.eventArrivalTimes,
    );
    const eventDepartureTimes = this.buildEventTimesLabel(
      snapshot.budget.eventDates,
      snapshot.budget.eventDepartureTimes,
      snapshot.budget.eventArrivalTimes,
    );

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
        { label: "Horário de chegada", value: eventArrivalTimes },
        { label: "Horário de partida", value: eventDepartureTimes },
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
        ...(hasDisplacementFee
          ? [
              {
                label: "Taxa de deslocamento",
                value: formatCurrencyBRL(displacementFee),
              },
            ]
          : []),
        ...(discount.label
          ? [
              {
                label: discount.label,
                value: `- ${formatCurrencyBRL(discount.amount)}`,
              },
            ]
          : []),
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
        ...(hasDisplacementFee
          ? [
              {
                description: DISPLACEMENT_FEE_DESCRIPTION,
                quantity: "1",
                unitPrice: formatCurrencyBRL(displacementFee),
                totalPrice: formatCurrencyBRL(displacementFee),
              },
            ]
          : []),
        ...(discount.amount > 0
          ? [
              {
                description: DISCOUNT_DESCRIPTION,
                quantity: "1",
                unitPrice: formatCurrencyBRL(-discount.amount),
                totalPrice: formatCurrencyBRL(-discount.amount),
              },
            ]
          : []),
      ],
      notes,
      totals: {
        subtotal: formatCurrencyBRL(snapshot.budget.subtotal),
        displacementFee: formatCurrencyBRL(displacementFee),
        discountLabel: discount.label,
        discountAmount:
          discount.amount > 0 ? formatCurrencyBRL(discount.amount) : undefined,
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

  private buildEventTimesLabel(
    dates: string[],
    times: string[],
    referenceTimes: string[] = [],
  ): string {
    if (!times.length) {
      return "A definir";
    }

    return times
      .map((time, index) => {
        const arrival = referenceTimes[index];
        const departure = times[index];
        const arrivalMinutes = parseTimeToMinutes(arrival);
        const departureMinutes = parseTimeToMinutes(departure);
        const isNextDay =
          arrivalMinutes !== undefined &&
          departureMinutes !== undefined &&
          departureMinutes > 0 &&
          departureMinutes < arrivalMinutes;

        const date = dates[index];
        if (!date) {
          return `${index + 1}o dia: ${time}`;
        }

        if (isNextDay) {
          return `${formatDateBR(addOneDayIsoDate(date))}: ${time} (dia seguinte)`;
        }

        return `${formatDateBR(date)}: ${time}`;
      })
      .join(" | ");
  }
}
