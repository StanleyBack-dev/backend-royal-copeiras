import { BuildBudgetProposalPdfPayloadService } from "../../services/pdf/build-budget-proposal-pdf-payload.service";
import { BudgetPdfSnapshot } from "../../interfaces/budget-pdf-snapshot.interface";
import { BudgetStatus } from "../../enums/budget-status.enum";
import { BudgetItemType } from "../../enums/budget-item-type.enum";
import { formatCurrencyBRL } from "../../../../utils/pdf";

function buildSnapshot(
  overrides: Partial<BudgetPdfSnapshot["budget"]>,
  items?: BudgetPdfSnapshot["items"],
): BudgetPdfSnapshot {
  return {
    schemaVersion: "1.0.0",
    generatedAt: "2026-09-10T12:00:00.000Z",
    budget: {
      idBudgets: "b1",
      idUsers: "u1",
      budgetNumber: "ORC-0001",
      status: BudgetStatus.DRAFT,
      issueDate: "2026-09-10",
      validUntil: "2026-09-25",
      eventDates: ["2026-10-01"],
      eventArrivalTimes: ["08:00"],
      eventDepartureTimes: ["18:00"],
      eventLocation: ["Salão Alfa"],
      guestCount: [50],
      durationHours: [10],
      discountType: [],
      discountPercentage: [],
      discountAmount: [],
      displacementFee: [],
      subtotal: 1000,
      totalAmount: 1000,
      ...overrides,
    },
    items: items ?? [
      {
        itemType: BudgetItemType.LABOR,
        description: "2 copeiras",
        quantity: 2,
        unitPrice: 500,
        totalPrice: 1000,
        sortOrder: 0,
        eventDateIndex: 0,
      },
    ],
  };
}

describe("BuildBudgetProposalPdfPayloadService — event detail labels", () => {
  const service = new BuildBudgetProposalPdfPayloadService();

  function detail(payload: ReturnType<typeof service.build>, label: string) {
    return payload.eventDetails.find((row) => row.label === label)?.value;
  }

  it("single-day: only the 'Datas do evento' card carries a date", () => {
    const payload = service.build(buildSnapshot({}), "hash-1");

    expect(detail(payload, "Datas do evento")).toBe("01/10/2026");
    expect(detail(payload, "Local")).toBe("Salão Alfa");
    expect(detail(payload, "Horário de chegada")).toBe("08:00");
    expect(detail(payload, "Convidados")).toBe("50");
    expect(detail(payload, "Duração")).toBe("10 horas");
  });

  it("multi-day: per-day cards use day ordinals, never the calendar date", () => {
    const payload = service.build(
      buildSnapshot({
        eventDates: ["2026-10-01", "2026-10-02"],
        eventArrivalTimes: ["08:00", "09:00"],
        eventDepartureTimes: ["18:00", "17:00"],
        eventLocation: ["Salão Alfa", "Salão Beta"],
        guestCount: [50, 60],
        durationHours: [10, 8],
      }),
      "hash-2",
    );

    expect(detail(payload, "Datas do evento")).toBe("01/10/2026 | 02/10/2026");
    expect(detail(payload, "Local")).toBe(
      "Dia 1: Salão Alfa | Dia 2: Salão Beta",
    );
    expect(detail(payload, "Convidados")).toBe("Dia 1: 50 | Dia 2: 60");
    expect(detail(payload, "Duração")).toBe("Dia 1: 10 horas | Dia 2: 8 horas");
    expect(detail(payload, "Horário de chegada")).toBe(
      "Dia 1: 08:00 | Dia 2: 09:00",
    );
    expect(detail(payload, "Local")).not.toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });
});

describe("BuildBudgetProposalPdfPayloadService — items table grouping", () => {
  const service = new BuildBudgetProposalPdfPayloadService();

  it("single-day: flat item list, no day bands", () => {
    const payload = service.build(buildSnapshot({}), "hash-flat");

    expect(payload.items.every((row) => row.kind !== "dayHeader")).toBe(true);
    expect(payload.items.every((row) => row.kind !== "daySubtotal")).toBe(true);
  });

  it("multi-day: items split into Dia N blocks with a subtotal band each", () => {
    const payload = service.build(
      buildSnapshot(
        {
          eventDates: ["2026-10-01", "2026-10-02"],
          eventArrivalTimes: ["08:00", "08:00"],
          eventDepartureTimes: ["18:00", "18:00"],
          eventLocation: ["Salão Alfa", "Salão Beta"],
          guestCount: [50, 50],
          durationHours: [10, 10],
          subtotal: 1800,
          totalAmount: 1800,
        },
        [
          {
            itemType: BudgetItemType.LABOR,
            description: "2 copeiras",
            quantity: 2,
            unitPrice: 500,
            totalPrice: 1000,
            sortOrder: 0,
            eventDateIndex: 0,
          },
          {
            itemType: BudgetItemType.LABOR,
            description: "1 garçom",
            quantity: 1,
            unitPrice: 800,
            totalPrice: 800,
            sortOrder: 1,
            eventDateIndex: 1,
          },
        ],
      ),
      "hash-grouped",
    );

    const headers = payload.items.filter((row) => row.kind === "dayHeader");
    const subtotals = payload.items.filter((row) => row.kind === "daySubtotal");

    expect(headers.map((row) => row.description)).toEqual([
      "Dia 1 - 01/10/2026",
      "Dia 2 - 02/10/2026",
    ]);
    expect(subtotals.map((row) => row.totalPrice)).toEqual([
      formatCurrencyBRL(1000),
      formatCurrencyBRL(800),
    ]);
    // combined total stays in the totals block
    expect(payload.totals.total).toBe(formatCurrencyBRL(1800));
  });

  it("multi-day: displacement fee is shown per day and folded into each subtotal", () => {
    const payload = service.build(
      buildSnapshot(
        {
          eventDates: ["2026-10-01", "2026-10-02"],
          eventArrivalTimes: ["08:00", "08:00"],
          eventDepartureTimes: ["18:00", "18:00"],
          eventLocation: ["Salão Alfa", "Salão Beta"],
          guestCount: [50, 50],
          durationHours: [10, 10],
          displacementFee: [120, 80],
          subtotal: 1800,
          totalAmount: 2000,
        },
        [
          {
            itemType: BudgetItemType.LABOR,
            description: "2 copeiras",
            quantity: 2,
            unitPrice: 500,
            totalPrice: 1000,
            sortOrder: 0,
            eventDateIndex: 0,
          },
          {
            itemType: BudgetItemType.LABOR,
            description: "1 garçom",
            quantity: 1,
            unitPrice: 800,
            totalPrice: 800,
            sortOrder: 1,
            eventDateIndex: 1,
          },
        ],
      ),
      "hash-disp",
    );

    const feeRows = payload.items.filter((row) =>
      row.description.startsWith("Taxa de deslocamento"),
    );
    expect(feeRows.map((row) => row.description)).toEqual([
      "Taxa de deslocamento (Dia 1)",
      "Taxa de deslocamento (Dia 2)",
    ]);
    expect(feeRows.map((row) => row.totalPrice)).toEqual([
      formatCurrencyBRL(120),
      formatCurrencyBRL(80),
    ]);

    const subtotals = payload.items.filter((row) => row.kind === "daySubtotal");
    expect(subtotals.map((row) => row.totalPrice)).toEqual([
      formatCurrencyBRL(1120),
      formatCurrencyBRL(880),
    ]);
    // no separate lump displacement row on multi-day
    expect(feeRows).toHaveLength(2);
  });
});
