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

function sumArray(values: number[]): number {
  return Number(values.reduce((sum, value) => sum + value, 0).toFixed(2));
}

function computeDayDiscountAmount(
  daySubtotal: number,
  dayFee: number,
  type: string,
  percentage: number,
  amount: number,
): number {
  const baseTotal = Number((daySubtotal + dayFee).toFixed(2));

  if (type === "percentage") {
    const calculated = baseTotal * (percentage / 100);
    return Number(Math.min(Math.max(calculated, 0), baseTotal).toFixed(2));
  }

  if (type === "amount") {
    return Number(Math.min(Math.max(amount, 0), baseTotal).toFixed(2));
  }

  return 0;
}

function resolveDiscountSummary(snapshot: BudgetPdfSnapshot) {
  const budget = snapshot.budget;
  const eventDayCount = budget.eventDates.length || 1;
  const displacementFeePerDay = budget.displacementFee ?? [];
  const discountTypePerDay = budget.discountType ?? [];
  const discountPercentagePerDay = budget.discountPercentage ?? [];
  const discountAmountPerDay = budget.discountAmount ?? [];

  const daySubtotals = Array.from({ length: eventDayCount }, (_, day) =>
    Number(
      snapshot.items
        .filter((item) => (item.eventDateIndex ?? 0) === day)
        .reduce((sum, item) => sum + item.totalPrice, 0)
        .toFixed(2),
    ),
  );

  let amount = 0;
  for (let day = 0; day < eventDayCount; day += 1) {
    amount += computeDayDiscountAmount(
      daySubtotals[day] ?? 0,
      displacementFeePerDay[day] ?? 0,
      discountTypePerDay[day] ?? "",
      discountPercentagePerDay[day] ?? 0,
      discountAmountPerDay[day] ?? 0,
    );
  }
  amount = Number(amount.toFixed(2));

  if (amount <= 0) {
    return { label: undefined, amount: 0 };
  }

  const types = new Set(discountTypePerDay.filter(Boolean));
  const isUniformType = types.size === 1;
  const uniformType = isUniformType ? [...types][0] : undefined;

  if (uniformType === "percentage") {
    const percentages = new Set(
      discountPercentagePerDay.filter((value) => value > 0),
    );
    if (percentages.size === 1) {
      return { label: `Desconto (${[...percentages][0]}%)`, amount };
    }
  }

  if (uniformType === "amount") {
    return { label: "Desconto (Valor Fixo)", amount };
  }

  return { label: "Desconto", amount };
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
    const displacementFee = sumArray(snapshot.budget.displacementFee ?? []);
    const hasDisplacementFee = displacementFee > 0;
    const discount = resolveDiscountSummary(snapshot);
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
          value: this.buildPerDayLabel(
            snapshot.budget.eventDates,
            snapshot.budget.eventLocation,
            (value) => value || "A definir",
          ),
        },
        { label: "Horário de chegada", value: eventArrivalTimes },
        { label: "Horário de partida", value: eventDepartureTimes },
        {
          label: "Convidados",
          value: this.buildPerDayLabel(
            snapshot.budget.eventDates,
            snapshot.budget.guestCount,
            (value) => (value ? String(value) : "Nao informado"),
          ),
        },
        {
          label: "Duração",
          value: this.buildPerDayLabel(
            snapshot.budget.eventDates,
            snapshot.budget.durationHours,
            (value) => (value ? `${value} horas` : "Não informada"),
          ),
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
                value: this.buildPerDayLabel(
                  snapshot.budget.eventDates,
                  snapshot.budget.displacementFee ?? [],
                  (value) => formatCurrencyBRL(value),
                ),
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

  private buildPerDayLabel<T>(
    dates: string[],
    values: T[],
    format: (value: T) => string,
  ): string {
    if (!values.length) {
      return "A definir";
    }

    return values
      .map((value, index) => {
        const date = dates[index];
        const formatted = format(value);
        return date ? `${formatDateBR(date)}: ${formatted}` : formatted;
      })
      .join(" | ");
  }
}
