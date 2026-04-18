import { Test, TestingModule } from "@nestjs/testing";
import { GetBudgetsService } from "../../services/get/get-budgets.service";
import { budgetMock } from "../../__mocks__/budget.mock";

describe("GetBudgetsService", () => {
  let service: GetBudgetsService;

  beforeAll(async () => {
    const serviceMock = {
      findAll: jest.fn().mockResolvedValue([budgetMock]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: GetBudgetsService, useValue: serviceMock }],
    }).compile();

    service = module.get<GetBudgetsService>(GetBudgetsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return a list of budgets", async () => {
    const result = await service.findAll("user-id-test");
    expect(result).toEqual([budgetMock]);
  });

  it("should return empty array if no budgets", async () => {
    (service.findAll as jest.Mock).mockResolvedValueOnce([]);
    const result = await service.findAll("user-id-test");
    expect(result).toEqual([]);
  });
});
