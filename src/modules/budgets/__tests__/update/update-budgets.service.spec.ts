import { Test, TestingModule } from "@nestjs/testing";
import { UpdateBudgetsService } from "../../services/update/update-budgets.service";
import { budgetMock } from "../../__mocks__/budget.mock";

describe("UpdateBudgetsService", () => {
  let service: UpdateBudgetsService;

  beforeAll(async () => {
    const serviceMock = {
      execute: jest.fn().mockResolvedValue({ ...budgetMock, status: "sent" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: UpdateBudgetsService, useValue: serviceMock }],
    }).compile();

    service = module.get<UpdateBudgetsService>(UpdateBudgetsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should update a budget", async () => {
    const result = await service.execute("user-id-test", {
      idBudgets: "budget-1",
    });

    expect(result.status).toBe("sent");
  });

  it("should throw error if budget not found", async () => {
    (service.execute as jest.Mock).mockRejectedValueOnce(
      new Error("Orçamento não encontrado."),
    );

    await expect(
      service.execute("user-id-test", { idBudgets: "missing" }),
    ).rejects.toThrow("Orçamento não encontrado.");
  });
});
