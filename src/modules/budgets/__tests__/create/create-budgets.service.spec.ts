import { Test, TestingModule } from "@nestjs/testing";
import { CreateBudgetsService } from "../../services/create/create-budgets.service";
import { budgetMock } from "../../__mocks__/budget.mock";

describe("CreateBudgetsService", () => {
  let service: CreateBudgetsService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue(budgetMock),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CreateBudgetsService, useValue: serviceMock }],
    }).compile();

    service = module.get<CreateBudgetsService>(CreateBudgetsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should create a budget", async () => {
    const result = await service.execute("user-id-test", {
      idLeads: "lead-1",
      validUntil: "2026-04-20",
      status: budgetMock.status,
      eventDates: ["2026-04-19"],
      eventLocation: "Polo Empresarial",
      guestCount: 150,
      durationHours: 6,
      paymentMethod: "PIX",
      advancePercentage: 30,
      items: [
        {
          description: "2 copeiras",
          quantity: 2,
          unitPrice: 500,
          sortOrder: 0,
        },
      ],
    });

    expect(result).toEqual(budgetMock);
  });

  it("should throw error when create fails", async () => {
    (service.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Erro ao criar orçamento."),
    );

    await expect(
      service.execute("user-id-test", {
        idLeads: "lead-1",
        validUntil: "2026-04-20",
        status: budgetMock.status,
        eventDates: ["2026-04-19"],
        eventLocation: "Polo Empresarial",
        guestCount: 150,
        durationHours: 6,
        paymentMethod: "PIX",
        advancePercentage: 30,
        items: [
          {
            description: "2 copeiras",
            quantity: 2,
            unitPrice: 500,
            sortOrder: 0,
          },
        ],
      }),
    ).rejects.toThrow("Erro ao criar orçamento.");
  });
});
